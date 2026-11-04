import { parseCategory } from "@/lib/menu-data";
import { menuUrl, qrFileName, qrSvg } from "@/lib/qr";
import { getSiteUrl } from "@/lib/site-url";

/** GET /qr.svg — QR code that opens the website (SITE_URL). Options: ?category=, ?download=1 or ?download=<qr id>. */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const category = parseCategory(params.get("category") ?? undefined);
  const svg = await qrSvg(menuUrl(await getSiteUrl(), category === "all" ? null : category));
  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      // The target can change (SITE_URL), so don't cache for long.
      "cache-control": "public, max-age=300",
      "x-content-type-options": "nosniff",
      ...(params.has("download") && {
        "content-disposition": `attachment; filename="${qrFileName(params.get("download"), "svg")}"`,
      }),
    },
  });
}
