// @vitest-environment node
import { describe, expect, it } from "vitest";
import { adminClaims, fakeJwt } from "@/test/helpers";
import { canManage, isAdminToken, isSignedInToken, readTokenClaims } from "./jwt";

describe("readTokenClaims", () => {
  it("decodes the payload, including Khmer (UTF-8) names", () => {
    const claims = readTokenClaims(fakeJwt(adminClaims()));
    expect(claims).toMatchObject({ email: "admin@coffeeshop.local", name: "អ្នកគ្រប់គ្រង", roles: ["ADMIN"] });
  });

  it.each([
    ["undefined", undefined],
    ["empty string", ""],
    ["no payload segment", "abc"],
    ["payload is not base64 JSON", "a.!!!.c"],
  ])("returns null for %s", (_label, token) => {
    expect(readTokenClaims(token)).toBeNull();
  });

  it("returns null when required claims are missing", () => {
    expect(readTokenClaims(fakeJwt({ sub: "x", roles: ["ADMIN"] }))).toBeNull(); // no exp
    expect(readTokenClaims(fakeJwt({ sub: "x", exp: 9999999999 }))).toBeNull(); // no roles
  });
});

describe("isAdminToken", () => {
  it("accepts an unexpired admin token", () => {
    expect(isAdminToken(fakeJwt(adminClaims()))).toBe(true);
  });

  it("rejects an expired admin token", () => {
    expect(isAdminToken(fakeJwt(adminClaims(-1)))).toBe(false);
  });

  it("rejects a customer token", () => {
    expect(isAdminToken(fakeJwt({ ...adminClaims(), roles: ["CUSTOMER"] }))).toBe(false);
  });

  it("rejects a missing or garbage token", () => {
    expect(isAdminToken(undefined)).toBe(false);
    expect(isAdminToken("not-a-jwt")).toBe(false);
  });

  it("uses the supplied clock", () => {
    const token = fakeJwt({ ...adminClaims(), exp: 1_000 });
    expect(isAdminToken(token, 999_000)).toBe(true);
    expect(isAdminToken(token, 1_000_000)).toBe(false);
  });
});

describe("isSignedInToken (who may open /admin)", () => {
  it.each([["ADMIN"], ["CUSTOMER"]])("accepts an unexpired %s token", (role) => {
    expect(isSignedInToken(fakeJwt({ ...adminClaims(), roles: [role] }))).toBe(true);
  });

  it("rejects expired, roleless and garbage tokens", () => {
    expect(isSignedInToken(fakeJwt({ ...adminClaims(-1), roles: ["CUSTOMER"] }))).toBe(false);
    expect(isSignedInToken(fakeJwt({ ...adminClaims(), roles: [] }))).toBe(false);
    expect(isSignedInToken(fakeJwt({ ...adminClaims(), roles: ["GUEST"] }))).toBe(false);
    expect(isSignedInToken(undefined)).toBe(false);
  });
});

describe("canManage (who may change the menu)", () => {
  it("is true only for ADMIN", () => {
    expect(canManage(adminClaims())).toBe(true);
    expect(canManage({ ...adminClaims(), roles: ["CUSTOMER"] })).toBe(false);
    expect(canManage(null)).toBe(false);
  });
});
