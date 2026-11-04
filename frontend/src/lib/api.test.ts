// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, BackendUnavailableError, apiFetch } from "./api";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

/** Awaits a promise that must reject and returns the error, typed for assertions. */
async function rejection<E extends Error>(promise: Promise<unknown>): Promise<E> {
  try {
    await promise;
  } catch (err) {
    return err as E;
  }
  throw new Error("expected the promise to reject");
}

function jsonResponse(status: number, body: unknown) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("apiFetch", () => {
  it("GETs from BACKEND_URL with query params, dropping empty ones", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, [{ id: "latte" }]));

    const data = await apiFetch("/api/products", { query: { category: "Latte", q: undefined } });

    expect(data).toEqual([{ id: "latte" }]);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("http://localhost:8080/api/products?category=Latte");
    expect(init.method).toBe("GET");
    expect(init.cache).toBe("no-store");
    expect(init.headers).not.toHaveProperty("Authorization");
  });

  it("sends JSON bodies and the bearer token", async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, { id: "p-1" }));

    await apiFetch("/api/admin/products", { method: "POST", body: { name: "x" }, token: "tok" });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe("POST");
    expect(init.body).toBe('{"name":"x"}');
    expect(init.headers).toMatchObject({ "Content-Type": "application/json", Authorization: "Bearer tok" });
  });

  it("sends FormData as multipart (no JSON content type) with a longer timeout", async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, { url: "/uploads/x.png" }));
    const form = new FormData();
    form.append("file", new Blob(["png"], { type: "image/png" }), "a.png");

    await apiFetch("/api/admin/uploads/images", { method: "POST", body: form, token: "tok" });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.body).toBe(form);
    expect(init.headers).not.toHaveProperty("Content-Type");
    expect(init.headers).toMatchObject({ Authorization: "Bearer tok" });
  });

  it("returns undefined for 204 No Content", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    await expect(apiFetch("/api/admin/products/x", { method: "DELETE", token: "t" })).resolves.toBeUndefined();
  });

  it("throws ApiError carrying the backend's Khmer message and field errors", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(400, { status: 400, message: "សូមពិនិត្យ", fieldErrors: { name: "សូមបញ្ចូលឈ្មោះ" } }),
    );

    const err = await rejection<ApiError>(apiFetch("/api/admin/products", { method: "POST", body: {} }));

    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(400);
    expect(err.message).toBe("សូមពិនិត្យ");
    expect(err.fieldErrors).toEqual({ name: "សូមបញ្ចូលឈ្មោះ" });
  });

  it("throws ApiError with a fallback message when the error body isn't JSON", async () => {
    fetchMock.mockResolvedValue(new Response("<html>oops</html>", { status: 502 }));

    const err = await rejection<ApiError>(apiFetch("/api/products"));

    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(502);
    expect(err.fieldErrors).toEqual({});
  });

  it("wraps network failures in BackendUnavailableError", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));

    const err = await rejection<BackendUnavailableError>(apiFetch("/api/products"));

    expect(err).toBeInstanceOf(BackendUnavailableError);
    expect(err.message).toMatch(/ម៉ាស៊ីនមេ/);
  });
});
