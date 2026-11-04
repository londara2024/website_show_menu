import "server-only";

import { apiFetch } from "./api";
import { asAdmin, asViewer } from "./authed-call";
import { KHR_PER_USD } from "./menu-data";

export type ExchangeRate = { khrPerUsd: number; updatedAt: string; updatedBy?: string | null };

/**
 * Current riel per US dollar for showing prices. Never throws: if the API is unreachable the
 * menu still renders, using the fallback rate.
 */
export async function getKhrPerUsd(): Promise<number> {
  try {
    return (await apiFetch<ExchangeRate>("/api/exchange-rate")).khrPerUsd;
  } catch {
    return KHR_PER_USD;
  }
}

/** Dashboard copy, including who changed it last (ADMIN or CUSTOMER). */
export const getExchangeRate = () => asViewer((token) => apiFetch<ExchangeRate>("/api/admin/exchange-rate", { token }));

/** ADMIN only. */
export const updateExchangeRate = (khrPerUsd: number) =>
  asAdmin((token) => apiFetch<ExchangeRate>("/api/admin/exchange-rate", { method: "PUT", body: { khrPerUsd }, token }));
