/** Builds an unsigned JWT-shaped string with the given claims (signature isn't checked client-side). */
export function fakeJwt(claims: Record<string, unknown>): string {
  const b64url = (obj: unknown) =>
    Buffer.from(JSON.stringify(obj), "utf8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${b64url({ alg: "HS256", typ: "JWT" })}.${b64url(claims)}.signature`;
}

/** Token claims for an admin whose token expires `inSeconds` from now. */
export function adminClaims(inSeconds = 3600) {
  return {
    sub: "8f9c2b1e-0000-4000-8000-000000000001",
    email: "admin@coffeeshop.local",
    name: "អ្នកគ្រប់គ្រង",
    roles: ["ADMIN"],
    exp: Math.floor(Date.now() / 1000) + inSeconds,
  };
}

/** Thrown by the mocked `redirect()` so tests can assert the target URL. */
export class RedirectError extends Error {
  constructor(readonly url: string) {
    super(`NEXT_REDIRECT ${url}`);
  }
}

export function formData(entries: Record<string, string | string[] | undefined>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    if (value === undefined) continue;
    for (const v of Array.isArray(value) ? value : [value]) fd.append(key, v);
  }
  return fd;
}
