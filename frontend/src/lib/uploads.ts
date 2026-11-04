import "server-only";

import { apiFetch } from "./api";
import { asAdmin } from "./authed-call";

/** Same limits as the backend (app.uploads.max-size, ImageType). Checked here first for a fast, friendly error. */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export type StoredImage = { filename: string; url: string; contentType: string; size: number };

/** Uploads a product image (ADMIN only). Returns its public URL, e.g. "/uploads/<uuid>.jpg". */
export function uploadImage(file: File): Promise<StoredImage> {
  const form = new FormData();
  form.append("file", file, file.name);
  return asAdmin((token) => apiFetch<StoredImage>("/api/admin/uploads/images", { method: "POST", body: form, token }));
}
