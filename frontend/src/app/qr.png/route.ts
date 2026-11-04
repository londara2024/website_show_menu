import { parseCategory } from "@/lib/menu-data";
import { menuUrl, qrFileName, qrPng } from "@/lib/qr";
import { getSiteUrl } from "@/lib/site-url";

/**
 * GET /qr.png — QR code that opens the website (SITE_URL).
 * Options: ?category=Coffee (menu filtered), ?size=256..2048, ?download=1 or ?download=<qr id>.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const requested = Number(params.get("size") ?? 1024);
  const size = Number.isFinite(requested) ? Math.min(2048, Math.max(256, Math.round(requested))) : 1024;
  const category = parseCategory(params.get("category") ?? undefined);

  const png = await qrPng(menuUrl(await getSiteUrl(), category === "all" ? null : category), size);
  return new Response(new Uint8Array(png), {
    headers: {
      "content-type": "image/png",
      "cache-control": "public, max-age=300",
      "x-content-type-options": "nosniff",
      ...(params.has("download") && {
        "content-disposition": `attachment; filename="${qrFileName(params.get("download"), "png")}"`,
      }),
    },
  });
}
