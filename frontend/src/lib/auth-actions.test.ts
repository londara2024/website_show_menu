// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RedirectError, formData } from "@/test/helpers";
import { ApiError, BackendUnavailableError } from "./api";
import { loginAction, logoutAction, registerAction, type LoginState, type RegisterState } from "./auth-actions";

const mocks = vi.hoisted(() => ({
  apiFetch: vi.fn(),
  setSession: vi.fn(),
  clearSession: vi.fn(),
}));

vi.mock("next/navigation", async () => {
  const { RedirectError } = await import("@/test/helpers");
  return {
    redirect: (url: string) => {
      throw new RedirectError(url);
    },
  };
});
vi.mock("./api", async (importOriginal) => ({ ...(await importOriginal<typeof import("./api")>()), apiFetch: mocks.apiFetch }));
vi.mock("./session", () => ({ setSession: mocks.setSession, clearSession: mocks.clearSession }));

const LOGIN0: LoginState = { errors: {}, values: { email: "", remember: false } };
const REGISTER0: RegisterState = { errors: {}, values: { name: "", email: "", terms: false } };

const token = (role: "ADMIN" | "CUSTOMER") => ({
  token: "jwt-token",
  expiresAt: "2030-01-01T00:00:00Z",
  user: { id: "u1", email: "a@b.co", fullName: "A", role },
});

/** Runs an action that should redirect and returns the redirect target. */
async function redirectOf(promise: Promise<unknown>): Promise<string> {
  const err = await promise.then(
    () => null,
    (e) => e,
  );
  if (!(err instanceof RedirectError)) throw new Error(`expected a redirect, got ${err}`);
  return err.url;
}

beforeEach(() => {
  mocks.apiFetch.mockReset();
  mocks.setSession.mockReset();
  mocks.clearSession.mockReset();
});

describe("loginAction", () => {
  it("validates before calling the backend", async () => {
    const state = await loginAction(LOGIN0, formData({ email: "not-an-email", password: "" }));
    expect(state.errors).toEqual({
      email: "សូមបញ្ចូលអ៊ីមែលឲ្យបានត្រឹមត្រូវ។",
      password: "សូមបញ្ចូលពាក្យសម្ងាត់។",
    });
    expect(mocks.apiFetch).not.toHaveBeenCalled();
  });

  it("shows the Khmer bad-credentials message on 401 and keeps the email", async () => {
    mocks.apiFetch.mockRejectedValue(new ApiError(401, "x"));
    const state = await loginAction(LOGIN0, formData({ email: "a@b.co", password: "wrong", remember: "on" }));
    expect(state.errors.form).toBe("អ៊ីមែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ។");
    expect(state.values).toEqual({ email: "a@b.co", remember: true });
    expect(mocks.setSession).not.toHaveBeenCalled();
  });

  it("explains when the backend is down", async () => {
    mocks.apiFetch.mockRejectedValue(new BackendUnavailableError(new Error("ECONNREFUSED")));
    const state = await loginAction(LOGIN0, formData({ email: "a@b.co", password: "pw" }));
    expect(state.errors.form).toMatch(/ម៉ាស៊ីនមេ/);
  });

  it("stores the token and sends admins to /admin", async () => {
    mocks.apiFetch.mockResolvedValue(token("ADMIN"));
    const url = await redirectOf(loginAction(LOGIN0, formData({ email: " a@b.co ", password: "pw", remember: "on" })));

    expect(url).toBe("/admin");
    expect(mocks.apiFetch).toHaveBeenCalledWith("/api/auth/login", {
      method: "POST",
      body: { email: "a@b.co", password: "pw" },
    });
    expect(mocks.setSession).toHaveBeenCalledWith("jwt-token", "2030-01-01T00:00:00Z", true);
  });

  it("uses a session cookie when 'keep me signed in' is off", async () => {
    mocks.apiFetch.mockResolvedValue(token("ADMIN"));
    await redirectOf(loginAction(LOGIN0, formData({ email: "a@b.co", password: "pw" })));
    expect(mocks.setSession).toHaveBeenCalledWith("jwt-token", "2030-01-01T00:00:00Z", false);
  });

  it("returns admins to a same-site ?next page", async () => {
    mocks.apiFetch.mockResolvedValue(token("ADMIN"));
    const url = await redirectOf(
      loginAction(LOGIN0, formData({ email: "a@b.co", password: "pw", next: "/admin/add-ons?notice=x" })),
    );
    expect(url).toBe("/admin/add-ons?notice=x");
  });

  it.each(["//evil.example", "https://evil.example", "/\\evil.example", "admin"])(
    "ignores an unsafe ?next of %s (no open redirect)",
    async (next) => {
      mocks.apiFetch.mockResolvedValue(token("ADMIN"));
      expect(await redirectOf(loginAction(LOGIN0, formData({ email: "a@b.co", password: "pw", next })))).toBe("/admin");
    },
  );

  it("sends customers to the admin dashboard too (view-only for them)", async () => {
    mocks.apiFetch.mockResolvedValue(token("CUSTOMER"));
    expect(await redirectOf(loginAction(LOGIN0, formData({ email: "a@b.co", password: "pw" })))).toBe("/admin");
  });

  it("returns customers to a same-site ?next page as well", async () => {
    mocks.apiFetch.mockResolvedValue(token("CUSTOMER"));
    const url = await redirectOf(loginAction(LOGIN0, formData({ email: "a@b.co", password: "pw", next: "/admin/add-ons" })));
    expect(url).toBe("/admin/add-ons");
  });
});

describe("registerAction", () => {
  const valid = { name: "សុខ ដារា", email: "new@b.co", password: "secret123", confirm: "secret123", terms: "on" };

  it("validates every field before calling the backend", async () => {
    const state = await registerAction(REGISTER0, formData({ name: "x", email: "bad", password: "123", confirm: "456" }));
    expect(Object.keys(state.errors).sort()).toEqual(["confirm", "email", "name", "password", "terms"]);
    expect(mocks.apiFetch).not.toHaveBeenCalled();
  });

  it("rejects passwords over BCrypt's 72-character limit", async () => {
    const long = "a".repeat(73);
    const state = await registerAction(REGISTER0, formData({ ...valid, password: long, confirm: long }));
    expect(state.errors.password).toMatch(/72/);
  });

  it("creates the account and redirects to login with a success flag", async () => {
    mocks.apiFetch.mockResolvedValue({ id: "u2" });
    expect(await redirectOf(registerAction(REGISTER0, formData(valid)))).toBe("/login?registered=1");
    expect(mocks.apiFetch).toHaveBeenCalledWith("/api/auth/register", {
      method: "POST",
      body: { fullName: "សុខ ដារា", email: "new@b.co", password: "secret123" },
    });
  });

  it("shows the backend's duplicate-email error on the email field", async () => {
    mocks.apiFetch.mockRejectedValue(new ApiError(409, "អ៊ីមែលនេះត្រូវបានប្រើរួចហើយ។", { email: "អ៊ីមែលនេះត្រូវបានប្រើរួចហើយ។" }));
    const state = await registerAction(REGISTER0, formData(valid));
    expect(state.errors.email).toBe("អ៊ីមែលនេះត្រូវបានប្រើរួចហើយ។");
    expect(state.values).toEqual({ name: "សុខ ដារា", email: "new@b.co", terms: true });
  });

  it("maps the backend's fullName error onto the name field", async () => {
    mocks.apiFetch.mockRejectedValue(new ApiError(400, "x", { fullName: "ឈ្មោះខុស" }));
    expect((await registerAction(REGISTER0, formData(valid))).errors.name).toBe("ឈ្មោះខុស");
  });
});

describe("logoutAction", () => {
  it("clears the session and goes to /login", async () => {
    expect(await redirectOf(logoutAction())).toBe("/login");
    expect(mocks.clearSession).toHaveBeenCalledOnce();
  });
});
