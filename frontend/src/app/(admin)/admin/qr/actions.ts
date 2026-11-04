"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { toFormErrors } from "@/lib/form-errors";
import { CATEGORIES, type Category } from "@/lib/menu-data";
import { addQrCode, deleteQrCode, setQrCodeActive, updateQrCode, type QrCodeInput } from "@/lib/qr-codes";

/** `category` is "" for the whole menu. */
export type QrCodeFormValues = { name: string; category: string; active: boolean };

export type QrCodeFormState = {
  errors: Partial<Record<keyof QrCodeFormValues | "form", string>>;
  values: QrCodeFormValues;
};

function parseQrCodeForm(formData: FormData): {
  values: QrCodeFormValues;
  errors: QrCodeFormState["errors"];
  data?: QrCodeInput;
} {
  const text = (key: string) => String(formData.get(key) ?? "").trim();
  const values: QrCodeFormValues = {
    name: text("name"),
    category: text("category") === "all" ? "" : text("category"),
    active: formData.get("active") === "on",
  };

  const errors: QrCodeFormState["errors"] = {};
  if (values.name.length < 2) errors.name = "សូមបញ្ចូលឈ្មោះ (យ៉ាងតិច 2 តួអក្សរ)។";
  else if (values.name.length > 60) errors.name = "ឈ្មោះវែងពេក (អតិបរមា 60 តួអក្សរ)។";
  const category = values.category ? CATEGORIES.find((c) => c === values.category) : null;
  if (category === undefined) errors.category = "សូមជ្រើសរើសប្រភេទ។";

  if (Object.keys(errors).length > 0 || category === undefined) return { values, errors };
  return { values, errors, data: { name: values.name, category: category as Category | null, active: values.active } };
}

function refresh() {
  revalidatePath("/admin/qr", "layout");
}

/** Backend validation keys → form fields. */
const formFieldFor = (field: string) => (["name", "category"] as const).find((f) => f === field);

export async function createQrCodeAction(_prev: QrCodeFormState, formData: FormData): Promise<QrCodeFormState> {
  const { values, errors, data } = parseQrCodeForm(formData);
  if (!data) return { values, errors };
  try {
    await addQrCode(data);
  } catch (err) {
    return { values, errors: toFormErrors(err, formFieldFor) };
  }
  refresh();
  redirect("/admin/qr?notice=created");
}

export async function updateQrCodeAction(id: string, _prev: QrCodeFormState, formData: FormData): Promise<QrCodeFormState> {
  const { values, errors, data } = parseQrCodeForm(formData);
  if (!data) return { values, errors };
  try {
    await updateQrCode(id, data);
  } catch (err) {
    return { values, errors: toFormErrors(err, formFieldFor) };
  }
  refresh();
  redirect("/admin/qr?notice=updated");
}

export async function setQrCodeActiveAction(id: string, active: boolean) {
  await setQrCodeActive(id, active);
  refresh();
}

export async function deleteQrCodeAction(id: string) {
  await deleteQrCode(id);
  refresh();
}
