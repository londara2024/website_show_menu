import { backendUrl } from "@/lib/api";

/**
 * Serves uploaded product images from the website's own origin by proxying to the API's
 * public GET /uploads/{filename}. Product records store "/uploads/<id>.jpg", so the
 * image works wherever the site is hosted, and the API address stays private.
 */
const NAME = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|gif)$/;

export async function GET(_request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  if (!NAME.test(filename)) return new Response("Not found", { status: 404 });

  let upstream: Response;
  try {
    upstream = await fetch(backendUrl(`/uploads/${filename}`), { cache: "no-store", signal: AbortSignal.timeout(15_000) });
  } catch {
    return new Response("Image service unavailable", { status: 502 });
  }
  if (!upstream.ok || !upstream.body) return new Response("Not found", { status: upstream.status === 404 ? 404 : 502 });

  const headers = new Headers();
  for (const h of ["content-type", "content-length", "cache-control", "etag", "last-modified"]) {
    const v = upstream.headers.get(h);
    if (v) headers.set(h, v);
  }
  headers.set("x-content-type-options", "nosniff");
  return new Response(upstream.body, { status: 200, headers });
}
