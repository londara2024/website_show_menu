// @vitest-environment node
import { describe, expect, it } from "vitest";
import { menuUrl, qrFileName, qrPng, qrSvg } from "./qr";

describe("qr", () => {
  it("renders an SVG in the brand colours", async () => {
    const svg = await qrSvg("https://coffeeshop.example.com");
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg).toContain("#54280f");
    expect(svg).toContain("#ffffff");
  });

  it("encodes different URLs differently and the same URL identically", async () => {
    const a = await qrSvg("https://a.example.com");
    expect(await qrSvg("https://a.example.com")).toBe(a);
    expect(await qrSvg("https://b.example.com")).not.toBe(a);
  });

  it("renders a PNG", async () => {
    const png = await qrPng("https://coffeeshop.example.com", 256);
    expect([...png.subarray(0, 8)]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect(png.readUInt32BE(16)).toBeGreaterThanOrEqual(256); // IHDR width
  });
});

describe("menuUrl", () => {
  it("opens the whole menu or one category", () => {
    expect(menuUrl("https://shop.example.com")).toBe("https://shop.example.com/");
    expect(menuUrl("https://shop.example.com", null)).toBe("https://shop.example.com/");
    expect(menuUrl("https://shop.example.com", "Cold Drinks")).toBe("https://shop.example.com/?category=Cold%20Drinks");
  });
});

describe("qrFileName", () => {
  it.each([
    [null, "coffeeshop-qr.png"],
    ["", "coffeeshop-qr.png"],
    ["1", "coffeeshop-qr.png"],
    ["q-1a2b3c4d", "coffeeshop-qr-q-1a2b3c4d.png"],
    ['../"evil"\r\n', "coffeeshop-qr-evil.png"],
  ])("%j → %j", (download, expected) => {
    expect(qrFileName(download, "png")).toBe(expected);
  });
});
