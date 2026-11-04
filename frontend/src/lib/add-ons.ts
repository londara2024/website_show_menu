import "server-only";

import { ApiError, apiFetch } from "./api";
import { ADDON_GROUPS, type AddOn, type AddOnGroupKey } from "./menu-data";
import { asAdmin, asViewer } from "./authed-call";

/** Body of create/update calls — mirrors the backend's AddOnRequest. */
export type AddOnInput = Omit<AddOn, "id">;

// ---------- public ----------

/** Active add-ons grouped for the public menu, in fixed group order; empty groups are dropped. */
export async function getActiveAddOnGroups(): Promise<{ key: AddOnGroupKey; title: string; items: AddOn[] }[]> {
  const active = await apiFetch<AddOn[]>("/api/add-ons");
  return ADDON_GROUPS.map((g) => ({ ...g, items: active.filter((a) => a.group === g.key) })).filter(
    (g) => g.items.length > 0,
  );
}

// ---------- admin: reads for any signed-in user, changes for ADMIN only ----------

export const getAddOns = () => asViewer((token) => apiFetch<AddOn[]>("/api/admin/add-ons", { token }));

/** Undefined if the id doesn't exist. */
export async function getAddOn(id: string): Promise<AddOn | undefined> {
  try {
    return await asViewer((token) => apiFetch<AddOn>(`/api/admin/add-ons/${encodeURIComponent(id)}`, { token }));
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return undefined;
    throw err;
  }
}

export const addAddOn = (input: AddOnInput) =>
  asAdmin((token) => apiFetch<AddOn>("/api/admin/add-ons", { method: "POST", body: input, token }));

export const updateAddOn = (id: string, input: AddOnInput) =>
  asAdmin((token) =>
    apiFetch<AddOn>(`/api/admin/add-ons/${encodeURIComponent(id)}`, { method: "PUT", body: input, token }),
  );

export const setAddOnActive = (id: string, active: boolean) =>
  asAdmin((token) =>
    apiFetch<AddOn>(`/api/admin/add-ons/${encodeURIComponent(id)}/active`, {
      method: "PATCH",
      body: { active },
      token,
    }),
  );

export const deleteAddOn = (id: string) =>
  asAdmin((token) => apiFetch<void>(`/api/admin/add-ons/${encodeURIComponent(id)}`, { method: "DELETE", token }));
