// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { RedirectError } from "@/test/helpers";
import { ApiError, BackendUnavailableError } from "./api";
import { toFormErrors } from "./form-errors";

vi.mock("next/navigation", () => ({
  // Mirrors Next: re-throws its own control-flow errors (redirect/notFound), ignores the rest.
  unstable_rethrow: (err: unknown) => {
    if (err instanceof RedirectError) throw err;
  },
}));

const field = (f: string) => (f.startsWith("sizes") ? "prices" : (["name", "tag"] as const).find((k) => k === f));

describe("toFormErrors", () => {
  it("maps backend field errors onto form fields", () => {
    const err = new ApiError(400, "សូមពិនិត្យ", { name: "ឈ្មោះខុស", "sizes[1].price": "តម្លៃខុស" });
    expect(toFormErrors(err, field)).toEqual({ name: "ឈ្មោះខុស", prices: "តម្លៃខុស" });
  });

  it("keeps the first message when several backend fields map to the same input", () => {
    const err = new ApiError(400, "x", { "sizes[0].price": "ទី១", "sizes[2].price": "ទី៣" });
    expect(toFormErrors(err, field)).toEqual({ prices: "ទី១" });
  });

  it("puts unknown backend fields on the form-level error", () => {
    const err = new ApiError(400, "x", { somethingElse: "ខុស" });
    expect(toFormErrors(err, field)).toEqual({ form: "ខុស" });
  });

  it("uses the backend message when there are no field errors", () => {
    expect(toFormErrors(new ApiError(409, "មានរួចហើយ"), field)).toEqual({ form: "មានរួចហើយ" });
  });

  it("uses the not-found message for 404", () => {
    expect(toFormErrors(new ApiError(404, "x"), field, "រកមិនឃើញ")).toEqual({ form: "រកមិនឃើញ" });
  });

  it("explains when the backend is unreachable", () => {
    expect(toFormErrors(new BackendUnavailableError(new Error("down")), field).form).toMatch(/ម៉ាស៊ីនមេ/);
  });

  it("falls back to a generic message for unexpected errors", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(toFormErrors(new Error("boom"), field).form).toMatch(/រក្សាទុកមិនបាន/);
  });

  it("re-throws Next.js redirects instead of turning them into form errors", () => {
    expect(() => toFormErrors(new RedirectError("/login"), field)).toThrow(RedirectError);
  });
});
