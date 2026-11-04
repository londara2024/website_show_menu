// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { qrSvg } from "@/lib/qr";
import { GET as png } from "./route";
import { GET as svg } from "../qr.svg/route";

vi.mock("@/lib/site-url", () => ({ getSiteUrl: async () => "https://coffeeshop.example.com" }));

const req = (path: string) => new Request(`http://localhost:3000${path}`);
const widthOf = async (res: Response) => Buffer.from(await res.arrayBuffer()).readUInt32BE(16);

describe("/qr.png and /qr.svg", () => {
  it("serves a PNG, shown inline by default", async () => {
    const res = await png(req("/qr.png"));
    expect(res.headers.get("content-type")).toBe("image/png");
    expect(res.headers.get("content-disposition")).toBeNull();
  });

  it("?download= makes it a file download, optionally named after the code", async () => {
    expect((await png(req("/qr.png?download=1"))).headers.get("content-disposition")).toContain('filename="coffeeshop-qr.png"');
    expect((await svg(req("/qr.svg?download=1"))).headers.get("content-disposition")).toContain('filename="coffeeshop-qr.svg"');
    expect((await png(req("/qr.png?download=q-1a2b"))).headers.get("content-disposition")).toContain('filename="coffeeshop-qr-q-1a2b.png"');
  });

  it("clamps ?size to 256–2048", async () => {
    const small = await widthOf(await png(req("/qr.png?size=10")));
    const big = await widthOf(await png(req("/qr.png?size=99999")));
    expect(small).toBeGreaterThanOrEqual(256);
    expect(small).toBeLessThan(400);
    expect(big).toBeLessThanOrEqual(2048);
    expect(await widthOf(await png(req("/qr.png?size=abc")))).toBeGreaterThan(900); // default ~1024
  });

  it("serves an SVG with a safe content type", async () => {
    const res = await svg(req("/qr.svg"));
    expect(res.headers.get("content-type")).toBe("image/svg+xml; charset=utf-8");
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
    expect(await res.text()).toBe(await qrSvg("https://coffeeshop.example.com/"));
  });

  it("?category= links to the filtered menu; unknown categories fall back to the whole menu", async () => {
    const filtered = await (await svg(req("/qr.svg?category=Cold%20Drinks"))).text();
    expect(filtered).toBe(await qrSvg("https://coffeeshop.example.com/?category=Cold%20Drinks"));
    const unknown = await (await svg(req("/qr.svg?category=Tea"))).text();
    expect(unknown).toBe(await qrSvg("https://coffeeshop.example.com/"));
  });
});
