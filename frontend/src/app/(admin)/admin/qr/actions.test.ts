// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api";
import { RedirectError, formData } from "@/test/helpers";
import { createQrCodeAction, deleteQrCodeAction, setQrCodeActiveAction, updateQrCodeAction, type QrCodeFormState } from "./actions";

const mocks = vi.hoisted(() => ({
  addQrCode: vi.fn(),
  updateQrCode: vi.fn(),
  setQrCodeActive: vi.fn(),
  deleteQrCode: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/qr-codes", () => mocks);
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

const EMPTY: QrCodeFormState = { errors: {}, values: { name: "", category: "", active: true } };

beforeEach(() => {
  for (const m of Object.values(mocks)) m.mockReset();
});

describe("createQrCodeAction", () => {
  it("validates name and category", async () => {
    const state = await createQrCodeAction(EMPTY, formData({ name: "x", category: "Tea" }));
    expect(Object.keys(state.errors).sort()).toEqual(["category", "name"]);
    expect(mocks.addQrCode).not.toHaveBeenCalled();
  });

  it('"all" means the whole menu (category null)', async () => {
    const err = await createQrCodeAction(EMPTY, formData({ name: "តុលេខ 1", category: "all", active: "on" })).catch((e) => e);
    expect(err).toBeInstanceOf(RedirectError);
    expect((err as RedirectError).url).toBe("/admin/qr?notice=created");
    expect(mocks.addQrCode).toHaveBeenCalledWith({ name: "តុលេខ 1", category: null, active: true });
    expect(mocks.revalidatePath).toHaveBeenCalled();
  });

  it("keeps a category and maps backend field errors onto the form", async () => {
    mocks.addQrCode.mockRejectedValue(new ApiError(400, "Validation failed", { name: "ឈ្មោះត្រូវមាន 2 ដល់ 60 តួអក្សរ។" }));
    const state = await createQrCodeAction(EMPTY, formData({ name: "តុ 2", category: "Cold Drinks" }));
    expect(mocks.addQrCode).toHaveBeenCalledWith({ name: "តុ 2", category: "Cold Drinks", active: false });
    expect(state.errors.name).toBe("ឈ្មោះត្រូវមាន 2 ដល់ 60 តួអក្សរ។");
    expect(state.values.category).toBe("Cold Drinks");
  });
});

describe("other QR actions", () => {
  it("update redirects with a notice", async () => {
    const err = await updateQrCodeAction("q-1", EMPTY, formData({ name: "បញ្ជរ", category: "Coffee", active: "on" })).catch((e) => e);
    expect((err as RedirectError).url).toBe("/admin/qr?notice=updated");
    expect(mocks.updateQrCode).toHaveBeenCalledWith("q-1", { name: "បញ្ជរ", category: "Coffee", active: true });
  });

  it("toggle and delete call the API and revalidate", async () => {
    await setQrCodeActiveAction("q-1", false);
    await deleteQrCodeAction("q-1");
    expect(mocks.setQrCodeActive).toHaveBeenCalledWith("q-1", false);
    expect(mocks.deleteQrCode).toHaveBeenCalledWith("q-1");
    expect(mocks.revalidatePath).toHaveBeenCalledTimes(2);
  });
});
