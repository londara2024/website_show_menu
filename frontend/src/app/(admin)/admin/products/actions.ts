"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { BADGE_PRESETS, CATEGORIES, SIZE_LABELS, type Category, type SizePrice } from "@/lib/menu-data";
import { toFormErrors } from "@/lib/form-errors";
import { addProduct, deleteProduct, setProductActive, updateProduct, type ProductInput } from "@/lib/products";
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES, uploadImage } from "@/lib/uploads";

export type ProductFormValues = {
  name: string;
  description: string;
  image: string;
  tag: string;
  badge: string;
  categories: string[];
  prices: [string, string, string];
  active: boolean;
};

export type ProductFormState = {
  errors: Partial<Record<keyof ProductFormValues | "form", string>>;
  values: ProductFormValues;
};

const VOLUMES = ["8 oz", "12 oz", "16 oz"] as const;

function isImageUrl(value: string) {
  if (value.startsWith("/")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function parseProductForm(formData: FormData): { values: ProductFormValues; errors: ProductFormState["errors"]; data?: ProductInput } {
  const text = (key: string) => String(formData.get(key) ?? "").trim();

  const values: ProductFormValues = {
    name: text("name"),
    description: text("description"),
    image: text("image"),
    tag: text("tag"),
    badge: text("badge"),
    categories: formData.getAll("categories").map(String),
    prices: [text("price-0"), text("price-1"), text("price-2")],
    active: formData.get("active") === "on",
  };

  const errors: ProductFormState["errors"] = {};
  if (values.name.length < 2) errors.name = "សូមបញ្ចូលឈ្មោះផលិតផល។";
  else if (values.name.length > 60) errors.name = "ឈ្មោះវែងពេក (អតិបរមា 60 តួអក្សរ)។";
  if (values.description.length < 10) errors.description = "សូមសរសេរការពិពណ៌នាយ៉ាងហោចណាស់ 10 តួអក្សរ។";
  else if (values.description.length > 240) errors.description = "ការពិពណ៌នាវែងពេក (អតិបរមា 240 តួអក្សរ)។";
  if (!isImageUrl(values.image)) errors.image = "សូមបញ្ចូល URL រូបភាពឲ្យបានត្រឹមត្រូវ (https://…)។";
  if (!values.tag) errors.tag = "សូមបញ្ចូលស្លាកលើរូបភាព (ឧ. លីងមធ្យម)។";
  else if (values.tag.length > 30) errors.tag = "ស្លាកវែងពេក (អតិបរមា 30 តួអក្សរ)។";

  const categories = values.categories.filter((c): c is Category => (CATEGORIES as string[]).includes(c));
  if (categories.length === 0) errors.categories = "សូមជ្រើសរើសយ៉ាងហោចណាស់មួយប្រភេទ។";

  const prices = values.prices.map(Number);
  if (prices.some((p, i) => !values.prices[i] || !Number.isFinite(p) || p <= 0 || p > 1000)) {
    errors.prices = "តម្លៃត្រូវតែជាលេខចន្លោះ 0.01 ដល់ 1000 ដុល្លារ។";
  }

  if (Object.keys(errors).length > 0) return { values, errors };

  return {
    values,
    errors,
    data: {
      name: values.name,
      description: values.description,
      image: values.image,
      imageAlt: values.name,
      tag: values.tag,
      badge: BADGE_PRESETS.find((b) => b.label === values.badge),
      categories,
      sizes: prices.map((price, i): SizePrice => ({ label: SIZE_LABELS[i], price, volume: VOLUMES[i] })),
      active: values.active,
    },
  };
}

function refresh() {
  // Public menu + every admin page.
  revalidatePath("/", "layout");
}

/** Backend validation keys → form fields ("sizes[1].price" → prices). */
function formFieldFor(field: string): keyof ProductFormValues | undefined {
  if (field.startsWith("sizes")) return "prices";
  if (field.startsWith("badge")) return "badge";
  if (field.startsWith("categories")) return "categories";
  if (field === "imageAlt") return "image";
  return (["name", "description", "image", "tag"] as const).find((f) => f === field);
}

// The form validates first (instant Khmer errors); the backend validates again and is the
// source of truth — its field errors are mapped back onto the same inputs.

export async function createProductAction(_prev: ProductFormState, formData: FormData): Promise<ProductFormState> {
  const { values, errors, data } = parseProductForm(formData);
  if (!data) return { values, errors };
  try {
    await addProduct(data);
  } catch (err) {
    return { values, errors: toFormErrors(err, formFieldFor) };
  }
  refresh();
  redirect("/admin/products?notice=created");
}

export async function updateProductAction(
  id: string,
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const { values, errors, data } = parseProductForm(formData);
  if (!data) return { values, errors };
  try {
    await updateProduct(id, data);
  } catch (err) {
    return {
      values,
      errors: toFormErrors(err, formFieldFor, "រកមិនឃើញផលិតផលនេះទេ (ប្រហែលជាត្រូវបានលុបរួចហើយ)។"),
    };
  }
  refresh();
  redirect("/admin/products?notice=updated");
}

export async function setProductActiveAction(id: string, active: boolean) {
  await setProductActive(id, active);
  refresh();
}

export async function deleteProductAction(id: string) {
  await deleteProduct(id);
  refresh();
}

export type UploadImageResult = { url: string; error?: undefined } | { url?: undefined; error: string };

/**
 * Uploads the product photo picked in the form and returns its URL for the image field.
 * Size/type are checked here for a fast Khmer error; the backend checks again, by the file's bytes.
 */
export async function uploadProductImageAction(formData: FormData): Promise<UploadImageResult> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "សូមជ្រើសរើសរូបភាព។" };
  if (file.size > MAX_UPLOAD_BYTES) return { error: "រូបភាពធំពេក (អតិបរមា 5MB)។" };
  if (file.type && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { error: "អនុញ្ញាតតែរូបភាព JPG, PNG, WebP ឬ GIF ប៉ុណ្ណោះ។" };
  }
  try {
    return { url: (await uploadImage(file)).url };
  } catch (err) {
    const errors = toFormErrors(err, (f) => (f === "file" ? "file" : undefined));
    return { error: errors.file ?? errors.form ?? "បង្ហោះរូបភាពមិនបានទេ។ សូមព្យាយាមម្ដងទៀត។" };
  }
}
