// @vitest-environment node
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { SESSION_COOKIE } from "@/lib/jwt";
import { adminClaims, fakeJwt } from "@/test/helpers";
import { config, proxy } from "./proxy";

function request(path: string, token?: string) {
  const req = new NextRequest(new URL(path, "http://localhost:3000"));
  if (token) req.cookies.set(SESSION_COOKIE, token);
  return req;
}

describe("proxy (admin route guard)", () => {
  it("only runs on /admin routes", () => {
    expect(config.matcher).toEqual(["/admin/:path*"]);
  });

  it("redirects logged-out visitors to /login, remembering where they were going", () => {
    const res = proxy(request("/admin/products?status=active"));
    expect(res.status).toBe(307);
    const location = new URL(res.headers.get("location")!);
    expect(location.pathname).toBe("/login");
    expect(location.searchParams.get("next")).toBe("/admin/products?status=active");
  });

  it("lets customers in (the dashboard is view-only for them)", () => {
    const res = proxy(request("/admin/products", fakeJwt({ ...adminClaims(), roles: ["CUSTOMER"] })));
    expect(res.headers.get("location")).toBeNull();
    expect(res.headers.get("x-middleware-next")).toBe("1");
  });

  it("redirects tokens with no dashboard role", () => {
    const res = proxy(request("/admin", fakeJwt({ ...adminClaims(), roles: ["GUEST"] })));
    expect(res.headers.get("location")).toContain("/login");
  });

  it("redirects expired admin sessions", () => {
    const res = proxy(request("/admin", fakeJwt(adminClaims(-60))));
    expect(res.headers.get("location")).toContain("/login");
  });

  it("lets admins through", () => {
    const res = proxy(request("/admin/add-ons", fakeJwt(adminClaims())));
    expect(res.headers.get("location")).toBeNull();
    expect(res.headers.get("x-middleware-next")).toBe("1");
  });
});
