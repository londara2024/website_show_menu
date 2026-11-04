// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api";
import { RedirectError, formData } from "@/test/helpers";
import {
  uploadProductImageAction,
  createProductAction,
  deleteProductAction,
  setProductActiveAction,
  updateProductAction,
  type ProductFormState,
} from "./actions";

const mocks = vi.hoisted(() => ({
  addProduct: vi.fn(),
  updateProduct: vi.fn(),
  setProductActive: vi.fn(),
  deleteProduct: vi.fn(),
  revalidatePath: vi.fn(),
  uploadImage: vi.fn(),
}));

vi.mock("@/lib/products", () => mocks);
vi.mock("@/lib/uploads", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/uploads")>()),
  uploadImage: mocks.uploadImage,
}));
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

const EMPTY: ProductFormState = {
  errors: {},
  values: { name: "", description: "", image: "", tag: "", badge: "", categories: [], prices: ["", "", ""], active: true },
};

const valid = {
  name: "កាហ្វេដូង",
  description: "កាហ្វេខ្លាំងលាយទឹកដោះដូងស្រស់ និងទឹកកក។",
  image: "https://example.com/coffee.jpg",
  tag: "ទឹកដោះដូង",
  badge: "ថ្មី",
  categories: ["Coffee", "Cold Drinks"],
  "price-0": "2.25",
  "price-1": "2.75",
  "price-2": "3.25",
  active: "on",
};

beforeEach(() => {
  for (const m of Object.values(mocks)) m.mockReset();
});

describe("createProductAction", () => {
  it("returns Khmer errors for an empty form without calling the API", async () => {
    const state = await createProductAction(EMPTY, formData({}));
    expect(Object.keys(state.errors).sort()).toEqual(["categories", "description", "image", "name", "prices", "tag"]);
    expect(state.errors.name).toBe("សូមបញ្ចូលឈ្មោះផលិតផល។");
    expect(mocks.addProduct).not.toHaveBeenCalled();
  });

  it("echoes the submitted values back so the form keeps them", async () => {
    const state = await createProductAction(EMPTY, formData({ name: "កាហ្វេ", categories: ["Latte"] }));
    expect(state.values).toMatchObject({ name: "កាហ្វេ", categories: ["Latte"] });
  });

  it.each([
    ["not a URL", "image", { image: "coffee.jpg" }],
    ["javascript: URL", "image", { image: "javascript:alert(1)" }],
    ["zero price", "prices", { "price-1": "0" }],
    ["price over 1000", "prices", { "price-2": "1001" }],
    ["unknown category only", "categories", { categories: ["Tea"] }],
    ["tag over 30 chars", "tag", { tag: "x".repeat(31) }],
  ])("rejects %s", async (_label, fieldName, override) => {
    const state = await createProductAction(EMPTY, formData({ ...valid, ...override }));
    expect(state.errors).toHaveProperty(fieldName);
    expect(mocks.addProduct).not.toHaveBeenCalled();
  });

  it("sends the API a ProductRequest-shaped body, then revalidates and redirects", async () => {
    mocks.addProduct.mockResolvedValue({ id: "p-1" });

    const err = await createProductAction(EMPTY, formData(valid)).catch((e) => e);

    expect(err).toBeInstanceOf(RedirectError);
    expect(err.url).toBe("/admin/products?notice=created");
    expect(mocks.addProduct).toHaveBeenCalledWith({
      name: "កាហ្វេដូង",
      description: "កាហ្វេខ្លាំងលាយទឹកដោះដូងស្រស់ និងទឹកកក។",
      image: "https://example.com/coffee.jpg",
      imageAlt: "កាហ្វេដូង",
      tag: "ទឹកដោះដូង",
      badge: { label: "ថ្មី", tone: "honey" },
      categories: ["Coffee", "Cold Drinks"],
      sizes: [
        { label: "តូច", price: 2.25, volume: "8 oz" },
        { label: "មធ្យម", price: 2.75, volume: "12 oz" },
        { label: "ធំ", price: 3.25, volume: "16 oz" },
      ],
      active: true,
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("sends no badge for 'none' and active=false when the switch is off", async () => {
    mocks.addProduct.mockResolvedValue({ id: "p-2" });
    await createProductAction(EMPTY, formData({ ...valid, badge: "none", active: undefined })).catch(() => {});
    expect(mocks.addProduct.mock.calls[0][0]).toMatchObject({ badge: undefined, active: false });
  });

  it("maps backend validation errors back onto the inputs", async () => {
    mocks.addProduct.mockRejectedValue(
      new ApiError(400, "x", { "sizes[1].price": "តម្លៃខុស", "badge.tone": "ពណ៌ខុស", imageAlt: "វែងពេក" }),
    );
    const state = await createProductAction(EMPTY, formData(valid));
    expect(state.errors).toEqual({ prices: "តម្លៃខុស", badge: "ពណ៌ខុស", image: "វែងពេក" });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("lets the expired-session redirect through", async () => {
    mocks.addProduct.mockRejectedValue(new RedirectError("/login?next=/admin"));
    await expect(createProductAction(EMPTY, formData(valid))).rejects.toMatchObject({ url: "/login?next=/admin" });
  });
});

describe("updateProductAction", () => {
  it("updates by id and redirects with the 'updated' notice", async () => {
    mocks.updateProduct.mockResolvedValue({ id: "latte" });
    const err = await updateProductAction("latte", EMPTY, formData(valid)).catch((e) => e);
    expect(mocks.updateProduct).toHaveBeenCalledWith("latte", expect.objectContaining({ name: "កាហ្វេដូង" }));
    expect(err.url).toBe("/admin/products?notice=updated");
  });

  it("shows a not-found message when the product was deleted meanwhile", async () => {
    mocks.updateProduct.mockRejectedValue(new ApiError(404, "x"));
    const state = await updateProductAction("gone", EMPTY, formData(valid));
    expect(state.errors.form).toMatch(/រកមិនឃើញផលិតផល/);
  });
});

describe("setProductActiveAction / deleteProductAction", () => {
  it("toggles and revalidates", async () => {
    await setProductActiveAction("latte", false);
    expect(mocks.setProductActive).toHaveBeenCalledWith("latte", false);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("deletes and revalidates", async () => {
    await deleteProductAction("latte");
    expect(mocks.deleteProduct).toHaveBeenCalledWith("latte");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/", "layout");
  });
});

describe("uploadProductImageAction", () => {
  const png = (bytes = 10, type = "image/png") => new File([new Uint8Array(bytes)], "latte.png", { type });
  const form = (file?: File) => {
    const fd = new FormData();
    if (file) fd.append("file", file);
    return fd;
  };

  it("uploads and returns the stored URL", async () => {
    mocks.uploadImage.mockResolvedValue({ url: "/uploads/abc.png", filename: "abc.png", contentType: "image/png", size: 10 });
    await expect(uploadProductImageAction(form(png()))).resolves.toEqual({ url: "/uploads/abc.png" });
    expect(mocks.uploadImage).toHaveBeenCalledOnce();
  });

  it("rejects a missing or empty file before calling the API", async () => {
    expect(await uploadProductImageAction(form())).toEqual({ error: "សូមជ្រើសរើសរូបភាព។" });
    expect(await uploadProductImageAction(form(png(0)))).toEqual({ error: "សូមជ្រើសរើសរូបភាព។" });
    expect(mocks.uploadImage).not.toHaveBeenCalled();
  });

  it("rejects files over 5 MB and non-image types before calling the API", async () => {
    expect((await uploadProductImageAction(form(png(5 * 1024 * 1024 + 1)))).error).toMatch(/ធំពេក/);
    expect((await uploadProductImageAction(form(png(10, "image/svg+xml")))).error).toMatch(/JPG, PNG, WebP ឬ GIF/);
    expect(mocks.uploadImage).not.toHaveBeenCalled();
  });

  it("shows the backend's Khmer file error (e.g. bytes aren't really an image)", async () => {
    mocks.uploadImage.mockRejectedValue(new ApiError(400, "x", { file: "អនុញ្ញាតតែរូបភាព JPG, PNG, WebP ឬ GIF ប៉ុណ្ណោះ។" }));
    expect(await uploadProductImageAction(form(png()))).toEqual({ error: "អនុញ្ញាតតែរូបភាព JPG, PNG, WebP ឬ GIF ប៉ុណ្ណោះ។" });
  });

  it("shows the no-permission message for customers (403)", async () => {
    mocks.uploadImage.mockRejectedValue(new ApiError(403, "អ្នកមិនមានសិទ្ធិធ្វើសកម្មភាពនេះទេ។"));
    expect((await uploadProductImageAction(form(png()))).error).toMatch(/មិនមានសិទ្ធិ/);
  });
});
