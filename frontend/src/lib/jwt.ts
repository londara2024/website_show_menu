/**
 * Reads (does NOT verify) a JWT payload. Used only for UX decisions — redirecting
 * logged-out users away from /admin, showing the user's name. The backend verifies the
 * signature on every API call, so a forged token gets nowhere.
 *
 * No Node APIs here: this runs in proxy.ts as well as on the server.
 */
export type TokenClaims = {
  sub: string;
  email: string;
  name: string;
  roles: string[];
  /** Expiry, seconds since epoch. */
  exp: number;
};

export const SESSION_COOKIE = "cs_token";

export function readTokenClaims(token: string | undefined): TokenClaims | null {
  if (!token) return null;
  const part = token.split(".")[1];
  if (!part) return null;
  try {
    const json = new TextDecoder().decode(
      Uint8Array.from(atob(part.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0)),
    );
    const claims = JSON.parse(json) as TokenClaims;
    return typeof claims.exp === "number" && Array.isArray(claims.roles) ? claims : null;
  } catch {
    return null;
  }
}

/** Roles that may open the /admin dashboard. CUSTOMERs see it view-only. */
const DASHBOARD_ROLES = ["ADMIN", "CUSTOMER"];

/** True if the token looks like an unexpired admin token (may change the menu). */
export function isAdminToken(token: string | undefined, now = Date.now()): boolean {
  const claims = readTokenClaims(token);
  return !!claims && claims.exp * 1000 > now && claims.roles.includes("ADMIN");
}

/** True if the token looks like an unexpired session of any dashboard role (ADMIN or CUSTOMER). */
export function isSignedInToken(token: string | undefined, now = Date.now()): boolean {
  const claims = readTokenClaims(token);
  return !!claims && claims.exp * 1000 > now && claims.roles.some((r) => DASHBOARD_ROLES.includes(r));
}

/** Whether these claims may change the menu (vs. view-only). */
export function canManage(claims: TokenClaims | null | undefined): boolean {
  return !!claims?.roles.includes("ADMIN");
}
