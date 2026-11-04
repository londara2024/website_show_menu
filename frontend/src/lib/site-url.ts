import "server-only";

import { headers } from "next/headers";

/**
 * Public address of the website — what the QR code opens.
 *
 * Set `SITE_URL` in frontend/.env (e.g. https://coffeeshop.example.com) for a fixed address.
 * If it's empty, the address the site is being served from is used (Host / X-Forwarded-* headers),
 * which is right for local use but may be an internal name behind some proxies — so set it in production.
 */
export async function getSiteUrl(): Promise<string> {
  const configured = normalizeSiteUrl(process.env.SITE_URL);
  if (configured) return configured;

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host) ? "http" : "https");
  return normalizeSiteUrl(`${proto}://${host}`) ?? "http://localhost:3000";
}

/** Valid http(s) URL without a trailing slash, or undefined. Exported for tests. */
export function normalizeSiteUrl(value: string | undefined | null): string | undefined {
  const v = value?.trim();
  if (!v) return undefined;
  try {
    const url = new URL(v);
    if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
    return url.toString().replace(/\/$/, "");
  } catch {
    return undefined;
  }
}
