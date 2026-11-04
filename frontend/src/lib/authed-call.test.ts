// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RedirectError, adminClaims, fakeJwt } from "@/test/helpers";
import { ApiError } from "./api";
import { asAdmin, asViewer } from "./authed-call";
import { SESSION_COOKIE } from "./jwt";

// Real session.ts + authed-call.ts; only Next's request APIs are mocked.
const cookie = vi.hoisted(() => ({ value: undefined as string | undefined }));

vi.mock("next/headers", () => ({
  cookies: async () => ({ get: (name: string) => (name === SESSION_COOKIE && cookie.value ? { value: cookie.value } : undefined) }),
}));
vi.mock("next/server", () => ({ connection: async () => {} }));
vi.mock("next/navigation", async () => {
  const { RedirectError } = await import("@/test/helpers");
  return {
    redirect: (url: string) => {
      throw new RedirectError(url);
    },
  };
});

const ADMIN = fakeJwt(adminClaims());
const CUSTOMER = fakeJwt({ ...adminClaims(), roles: ["CUSTOMER"] });

async function outcome(promise: Promise<unknown>) {
  try {
    return { value: await promise };
  } catch (err) {
    return { err };
  }
}

beforeEach(() => {
  cookie.value = undefined;
});

describe("asViewer (dashboard reads)", () => {
  it.each([
    ["admin", ADMIN],
    ["customer", CUSTOMER],
  ])("passes the %s's token to the call", async (_who, token) => {
    cookie.value = token;
    const call = vi.fn().mockResolvedValue("data");
    await expect(asViewer(call)).resolves.toBe("data");
    expect(call).toHaveBeenCalledWith(token);
  });

  it("sends logged-out users to /login", async () => {
    const call = vi.fn();
    const { err } = await outcome(asViewer(call));
    expect(err).toBeInstanceOf(RedirectError);
    expect((err as RedirectError).url).toBe("/login?next=/admin");
    expect(call).not.toHaveBeenCalled();
  });

  it("sends the user to /login when the API says the token is no longer valid (401)", async () => {
    cookie.value = ADMIN;
    const { err } = await outcome(asViewer(() => Promise.reject(new ApiError(401, "expired"))));
    expect((err as RedirectError).url).toBe("/login?next=/admin");
  });
});

describe("asAdmin (menu changes)", () => {
  it("lets admins through", async () => {
    cookie.value = ADMIN;
    const call = vi.fn().mockResolvedValue("ok");
    await expect(asAdmin(call)).resolves.toBe("ok");
  });

  it("refuses customers with a Khmer 403 — without calling the API and without a login redirect loop", async () => {
    cookie.value = CUSTOMER;
    const call = vi.fn();
    const { err } = await outcome(asAdmin(call));
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(403);
    expect((err as ApiError).message).toMatch(/មានតែអ្នកគ្រប់គ្រង/);
    expect(call).not.toHaveBeenCalled();
  });

  it("passes a 403 from the API through as an error (not a redirect)", async () => {
    cookie.value = ADMIN;
    const { err } = await outcome(asAdmin(() => Promise.reject(new ApiError(403, "no"))));
    expect(err).toBeInstanceOf(ApiError);
  });

  it("sends logged-out users to /login", async () => {
    const { err } = await outcome(asAdmin(vi.fn()));
    expect((err as RedirectError).url).toBe("/login?next=/admin");
  });
});
