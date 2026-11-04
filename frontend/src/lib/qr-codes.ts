import "server-only";

import { ApiError, apiFetch } from "./api";
import { asAdmin, asViewer } from "./authed-call";
import type { Category } from "./menu-data";

/** A printable QR code — mirrors the backend's QrCodeResponse. `category: null` = whole menu. */
export type QrCode = { id: string; name: string; category: Category | null; active: boolean };

/** Body of create/update calls — mirrors the backend's QrCodeRequest. */
export type QrCodeInput = Omit<QrCode, "id">;

// Reads for any signed-in user, changes for ADMIN only.

export const getQrCodes = () => asViewer((token) => apiFetch<QrCode[]>("/api/admin/qr-codes", { token }));

/** Undefined if the id doesn't exist. */
export async function getQrCode(id: string): Promise<QrCode | undefined> {
  try {
    return await asViewer((token) => apiFetch<QrCode>(`/api/admin/qr-codes/${encodeURIComponent(id)}`, { token }));
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return undefined;
    throw err;
  }
}

export const addQrCode = (input: QrCodeInput) =>
  asAdmin((token) => apiFetch<QrCode>("/api/admin/qr-codes", { method: "POST", body: input, token }));

export const updateQrCode = (id: string, input: QrCodeInput) =>
  asAdmin((token) =>
    apiFetch<QrCode>(`/api/admin/qr-codes/${encodeURIComponent(id)}`, { method: "PUT", body: input, token }),
  );

export const setQrCodeActive = (id: string, active: boolean) =>
  asAdmin((token) =>
    apiFetch<QrCode>(`/api/admin/qr-codes/${encodeURIComponent(id)}/active`, {
      method: "PATCH",
      body: { active },
      token,
    }),
  );

export const deleteQrCode = (id: string) =>
  asAdmin((token) => apiFetch<void>(`/api/admin/qr-codes/${encodeURIComponent(id)}`, { method: "DELETE", token }));
