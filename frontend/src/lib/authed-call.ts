import "server-only";

import { redirect } from "next/navigation";
import { ApiError } from "./api";
import { requireAdminToken, requireSessionToken } from "./session";

/**
 * Runs a backend call with the session token.
 * - A 401 from the API (expired/revoked token) sends the user back to /login.
 * - A 403 is re-thrown as an ApiError, so forms show "no permission" instead of redirecting
 *   a signed-in customer to /login (which would loop straight back to /admin).
 */
async function withToken<T>(getToken: () => Promise<string>, call: (token: string) => Promise<T>): Promise<T> {
  const token = await getToken();
  try {
    return await call(token);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) redirect("/login?next=/admin");
    throw err;
  }
}

/** Dashboard reads — any signed-in user (ADMIN, or CUSTOMER view-only). */
export const asViewer = <T>(call: (token: string) => Promise<T>) => withToken(requireSessionToken, call);

/** Menu changes — ADMIN only; a customer gets a 403 ApiError before the API is even called. */
export const asAdmin = <T>(call: (token: string) => Promise<T>) => withToken(requireAdminToken, call);
