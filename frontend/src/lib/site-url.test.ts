// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { getSiteUrl, normalizeSiteUrl } from "./site-url";

const headerMap = vi.hoisted(() => ({ value: new Map<string, string>() }));
vi.mock("next/headers", () => ({ headers: async () => ({ get: (k: string) => headerMap.value.get(k) ?? null }) }));

afterEach(() => {
  vi.unstubAllEnvs();
  headerMap.value = new Map();
});

describe("normalizeSiteUrl", () => {
  it.each([
    ["https://coffeeshop.example.com/", "https://coffeeshop.example.com"],
    ["  http://localhost:3000  ", "http://localhost:3000"],
    ["https://shop.example.com/menu/", "https://shop.example.com/menu"],
  ])("%j → %j", (input, expected) => {
    expect(normalizeSiteUrl(input)).toBe(expected);
  });

  it.each([undefined, null, "", "   ", "coffeeshop.example.com", "javascript:alert(1)", "ftp://x.com"])(
    "rejects %j",
    (input) => {
      expect(normalizeSiteUrl(input)).toBeUndefined();
    },
  );
});

describe("getSiteUrl", () => {
  it("uses SITE_URL from .env when set", async () => {
    vi.stubEnv("SITE_URL", "https://coffeeshop.example.com/");
    headerMap.value = new Map([["host", "internal:3000"]]);
    await expect(getSiteUrl()).resolves.toBe("https://coffeeshop.example.com");
  });

  it("falls back to the request host (http for localhost)", async () => {
    vi.stubEnv("SITE_URL", "");
    headerMap.value = new Map([["host", "localhost:3000"]]);
    await expect(getSiteUrl()).resolves.toBe("http://localhost:3000");
  });

  it("respects reverse-proxy headers", async () => {
    vi.stubEnv("SITE_URL", "");
    headerMap.value = new Map([
      ["host", "web:3000"],
      ["x-forwarded-host", "menu.example.com"],
      ["x-forwarded-proto", "https"],
    ]);
    await expect(getSiteUrl()).resolves.toBe("https://menu.example.com");
  });

  it("ignores an invalid SITE_URL instead of encoding garbage", async () => {
    vi.stubEnv("SITE_URL", "not a url");
    headerMap.value = new Map([["host", "localhost:3000"]]);
    await expect(getSiteUrl()).resolves.toBe("http://localhost:3000");
  });
});
