// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api";
import { RedirectError, formData } from "@/test/helpers";
import { createAddOnAction, deleteAddOnAction, setAddOnActiveAction, updateAddOnAction, type AddOnFormState } from "./actions";

const mocks = vi.hoisted(() => ({
  addAddOn: vi.fn(),
  updateAddOn: vi.fn(),
  setAddOnActive: vi.fn(),
  deleteAddOn: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/add-ons", () => mocks);
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

const EMPTY: AddOnFormState = { errors: {}, values: { group: "milk", name: "", price: "", active: true } };

beforeEach(() => {
  for (const m of Object.values(mocks)) m.mockReset();
});

describe("createAddOnAction", () => {
  it("validates group, name and price", async () => {
    const state = await createAddOnAction(EMPTY, formData({ group: "tea", name: "x", price: "-1" }));
    expect(Object.keys(state.errors).sort()).toEqual(["group", "name", "price"]);
    expect(mocks.addAddOn).not.toHaveBeenCalled();
  });

  it("allows a free add-on (price 0)", async () => {
    mocks.addAddOn.mockResolvedValue({ id: "a-1" });
    const err = await createAddOnAction(EMPTY, formData({ group: "syrup", name: "ស៊ីរ៉ូឥតគិតថ្លៃ", price: "0", active: "on" })).catch(
      (e) => e,
    );
    expect(err).toBeInstanceOf(RedirectError);
    expect(mocks.addAddOn).toHaveBeenCalledWith({ group: "syrup", name: "ស៊ីរ៉ូឥតគិតថ្លៃ", price: 0, active: true });
  });

  it("redirects with the 'created' notice", async () => {
    mocks.addAddOn.mockResolvedValue({ id: "a-1" });
    const err = await createAddOnAction(EMPTY, formData({ group: "milk", name: "ទឹកដោះសណ្ដែក", price: "0.6" })).catch((e) => e);
    expect(err.url).toBe("/admin/add-ons?notice=created");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("maps backend field errors", async () => {
    mocks.addAddOn.mockRejectedValue(new ApiError(400, "x", { price: "តម្លៃខុស" }));
    const state = await createAddOnAction(EMPTY, formData({ group: "milk", name: "ទឹកដោះ", price: "0.6" }));
    expect(state.errors).toEqual({ price: "តម្លៃខុស" });
  });
});

describe("updateAddOnAction / toggles", () => {
  it("updates by id", async () => {
    mocks.updateAddOn.mockResolvedValue({ id: "a-seed-1" });
    const err = await updateAddOnAction("a-seed-1", EMPTY, formData({ group: "milk", name: "ទឹកដោះ Oat", price: "0.75" })).catch(
      (e) => e,
    );
    expect(mocks.updateAddOn).toHaveBeenCalledWith("a-seed-1", { group: "milk", name: "ទឹកដោះ Oat", price: 0.75, active: false });
    expect(err.url).toBe("/admin/add-ons?notice=updated");
  });

  it("toggles active and deletes, revalidating each time", async () => {
    await setAddOnActiveAction("a-1", true);
    await deleteAddOnAction("a-1");
    expect(mocks.setAddOnActive).toHaveBeenCalledWith("a-1", true);
    expect(mocks.deleteAddOn).toHaveBeenCalledWith("a-1");
    expect(mocks.revalidatePath).toHaveBeenCalledTimes(2);
  });
});
