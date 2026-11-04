// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const fetchMock = vi.fn();
const NAME = "0e8c1f9a-0000-4000-8000-000000000000.png";
const call = (filename: string) => GET(new Request(`http://localhost:3000/uploads/${filename}`), { params: Promise.resolve({ filename }) });

beforeEach(() => vi.stubGlobal("fetch", fetchMock));
afterEach(() => {
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

describe("GET /uploads/[filename] (proxy to the API)", () => {
  it("streams the image from the backend with its caching headers", async () => {
    fetchMock.mockResolvedValue(
      new Response(new Uint8Array([0x89, 0x50]), {
        status: 200,
        headers: { "content-type": "image/png", "cache-control": "public, max-age=31536000, immutable", "x-other": "dropped" },
      }),
    );

    const res = await call(NAME);

    expect(String(fetchMock.mock.calls[0][0])).toBe(`http://localhost:8080/uploads/${NAME}`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/png");
    expect(res.headers.get("cache-control")).toContain("immutable");
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
    expect(res.headers.get("x-other")).toBeNull();
    expect(new Uint8Array(await res.arrayBuffer())).toEqual(new Uint8Array([0x89, 0x50]));
  });

  it.each(["../../etc/passwd", "notes.txt", "x.svg", "abc.png"])("404s for %s without calling the API", async (name) => {
    expect((await call(name)).status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("passes a backend 404 through", async () => {
    fetchMock.mockResolvedValue(new Response("nope", { status: 404 }));
    expect((await call(NAME)).status).toBe(404);
  });

  it("answers 502 when the backend is unreachable", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));
    expect((await call(NAME)).status).toBe(502);
  });
});
