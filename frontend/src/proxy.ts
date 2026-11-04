import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, isSignedInToken } from "@/lib/jwt";

/**
 * Keeps logged-out visitors out of /admin; any signed-in user (ADMIN, or CUSTOMER
 * view-only) may enter. This is a fast UX gate only: the token isn't verified here —
 * the Spring Boot API verifies it on every request and allows changes for ADMIN only,
 * so a forged cookie can open the page shell but can't read or change any data.
 */
export function proxy(request: NextRequest) {
  if (isSignedInToken(request.cookies.get(SESSION_COOKIE)?.value)) return NextResponse.next();

  const login = new URL("/login", request.url);
  login.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/admin/:path*"],
};
