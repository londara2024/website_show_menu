import "server-only";

import { ApiError, apiFetch } from "./api";
import type { CategoryFilter, Product } from "./menu-data";
import { asAdmin, asViewer } from "./authed-call";

/** Body of create/update calls — mirrors the backend's ProductRequest. */
export type ProductInput = Omit<Product, "id" | "createdAt">;


// ---------- public ----------

/** Active products for the public menu, filtered by the backend. */
export function getActiveProducts(filter: { category?: CategoryFilter; query?: string } = {}): Promise<Product[]> {
  return apiFetch<Product[]>("/api/products", {
    query: {
      category: filter.category && filter.category !== "all" ? filter.category : undefined,
      q: filter.query?.trim() || undefined,
    },
  });
}

// ---------- admin: reads for any signed-in user, changes for ADMIN only ----------

export const getProducts = () => asViewer((token) => apiFetch<Product[]>("/api/admin/products", { token }));

/** Undefined if the id doesn't exist. */
export async function getProduct(id: string): Promise<Product | undefined> {
  try {
    return await asViewer((token) => apiFetch<Product>(`/api/admin/products/${encodeURIComponent(id)}`, { token }));
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return undefined;
    throw err;
  }
}

export const addProduct = (input: ProductInput) =>
  asAdmin((token) => apiFetch<Product>("/api/admin/products", { method: "POST", body: input, token }));

export const updateProduct = (id: string, input: ProductInput) =>
  asAdmin((token) =>
    apiFetch<Product>(`/api/admin/products/${encodeURIComponent(id)}`, { method: "PUT", body: input, token }),
  );

export const setProductActive = (id: string, active: boolean) =>
  asAdmin((token) =>
    apiFetch<Product>(`/api/admin/products/${encodeURIComponent(id)}/active`, {
      method: "PATCH",
      body: { active },
      token,
    }),
  );

export const deleteProduct = (id: string) =>
  asAdmin((token) => apiFetch<void>(`/api/admin/products/${encodeURIComponent(id)}`, { method: "DELETE", token }));
