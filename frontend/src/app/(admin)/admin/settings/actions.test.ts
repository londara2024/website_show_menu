// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api";
import { RedirectError, formData } from "@/test/helpers";
import { updateExchangeRateAction, type RateFormState } from "./actions";

const mocks = vi.hoisted(() => ({ updateExchangeRate: vi.fn(), revalidatePath: vi.fn() }));

vi.mock("@/lib/exchange-rate", () => ({ updateExchangeRate: mocks.updateExchangeRate }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("next/navigation", async () => {
  const { RedirectError } = await import("@/test/helpers");
  return {
    redirect: (url: string) => {
      throw new RedirectError(url);
    },
    unstable_rethrow: (err: unknown) => {
      if (err instanceof RedirectError) throw err;
    },
  };
});

const START: RateFormState = { errors: {}, values: { khrPerUsd: "4100" } };

beforeEach(() => {
  mocks.updateExchangeRate.mockReset();
  mocks.revalidatePath.mockReset();
});

describe("updateExchangeRateAction", () => {
  it.each(["", "abc", "999", "10001", "4100.5", "-4100"])("rejects %j without calling the API", async (value) => {
    const state = await updateExchangeRateAction(START, formData({ khrPerUsd: value }));
    expect(state.errors.khrPerUsd).toMatch(/1,000 ដល់ 10,000/);
    expect(mocks.updateExchangeRate).not.toHaveBeenCalled();
  });

  it.each([
    ["4200", 4200],
    ["4,050", 4050],
    [" 4 100 ៛", 4100],
  ])("accepts %j, saves %d, refreshes every page and redirects", async (value, saved) => {
    mocks.updateExchangeRate.mockResolvedValue({ khrPerUsd: saved });
    const err = await updateExchangeRateAction(START, formData({ khrPerUsd: value })).catch((e) => e);
    expect(mocks.updateExchangeRate).toHaveBeenCalledWith(saved);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/", "layout");
    expect(err).toBeInstanceOf(RedirectError);
    expect(err.url).toBe("/admin/settings?notice=updated");
  });

  it("shows the backend's field error", async () => {
    mocks.updateExchangeRate.mockRejectedValue(new ApiError(400, "x", { khrPerUsd: "អត្រាខុស" }));
    expect((await updateExchangeRateAction(START, formData({ khrPerUsd: "4200" }))).errors).toEqual({ khrPerUsd: "អត្រាខុស" });
  });

  it("shows no-permission for customers (403)", async () => {
    mocks.updateExchangeRate.mockRejectedValue(new ApiError(403, "អ្នកមិនមានសិទ្ធិធ្វើសកម្មភាពនេះទេ។"));
    expect((await updateExchangeRateAction(START, formData({ khrPerUsd: "4200" }))).errors.form).toMatch(/មិនមានសិទ្ធិ/);
  });
});
