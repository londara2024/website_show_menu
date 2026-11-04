import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ApiError } from "./api";
import { SESSION_COOKIE, canManage, isAdminToken, isSignedInToken, readTokenClaims, type TokenClaims } from "./jwt";

// Secure cookies by default in production. Set COOKIE_SECURE=false only for plain-HTTP
// deployments you control (e.g. testing the Docker image on a LAN IP).
const secure = process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === "true" : process.env.NODE_ENV === "production";

/** Stores the backend JWT in an httpOnly cookie. `persistent` = "keep me signed in". */
export async function setSession(token: string, expiresAt: string, persistent: boolean) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    ...(persistent && { expires: new Date(expiresAt) }),
  });
}

export async function clearSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function getToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

// Expiry checks read the clock. `connection()` marks the caller as request-time, which
// Cache Components requires before Date.now() (otherwise prerendering a page fails).

/** Claims of the current session's token, or null if logged out / expired. */
export async function getSessionUser(): Promise<TokenClaims | null> {
  await connection();
  const claims = readTokenClaims(await getToken());
  return claims && claims.exp * 1000 > Date.now() ? claims : null;
}

/** Token of any signed-in user (ADMIN or CUSTOMER); otherwise redirects to /login. Use for dashboard reads. */
export async function requireSessionToken(): Promise<string> {
  await connection();
  const token = await getToken();
  if (!isSignedInToken(token)) redirect("/login?next=/admin");
  return token!;
}

/**
 * Token of a signed-in ADMIN. Logged-out users are redirected to /login; signed-in customers
 * get a 403 ApiError (shown as a form error) — never a redirect, which would loop them back here.
 * Use for every change to the menu.
 */
export async function requireAdminToken(): Promise<string> {
  const token = await requireSessionToken();
  if (!isAdminToken(token)) throw new ApiError(403, FORBIDDEN_MESSAGE);
  return token;
}

/** Whether the current user may change the menu. Read inside <Suspense> (it reads the session). */
export async function canManageMenu(): Promise<boolean> {
  return canManage(await getSessionUser());
}

export const FORBIDDEN_MESSAGE = "អ្នកមិនមានសិទ្ធិធ្វើសកម្មភាពនេះទេ។ មានតែអ្នកគ្រប់គ្រងទេដែលអាចកែប្រែម៉ឺនុយបាន។";
