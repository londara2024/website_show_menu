import "server-only";

import QRCode from "qrcode";
import type { Category } from "./menu-data";

/** Brand colours from the design (roast on white) — dark enough to scan reliably. */
const COLOR = { dark: "#54280f", light: "#ffffff" };

// "M" error correction survives a little wear on printed table cards; margin is the quiet zone.
const OPTIONS = { errorCorrectionLevel: "M" as const, margin: 2, color: COLOR };

export function qrSvg(url: string): Promise<string> {
  return QRCode.toString(url, { ...OPTIONS, type: "svg" });
}

/** PNG at roughly `size` pixels square (default suits printing on an A6 card). */
export function qrPng(url: string, size = 1024): Promise<Buffer> {
  return QRCode.toBuffer(url, { ...OPTIONS, type: "png", width: size });
}

/** The menu page a code opens: the site root, or the menu filtered to one category. */
export function menuUrl(siteUrl: string, category?: Category | null): string {
  return category ? `${siteUrl}/?category=${encodeURIComponent(category)}` : `${siteUrl}/`;
}

/** `?download=` value → file name. "1" (or empty) keeps the plain name; ids like "q-1a2b" are appended. */
export function qrFileName(download: string | null, ext: "png" | "svg"): string {
  const suffix = (download ?? "").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 40);
  return `coffeeshop-qr${suffix && suffix !== "1" ? `-${suffix}` : ""}.${ext}`;
}
