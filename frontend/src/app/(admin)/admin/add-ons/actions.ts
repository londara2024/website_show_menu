"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addAddOn, deleteAddOn, setAddOnActive, updateAddOn, type AddOnInput } from "@/lib/add-ons";
import { toFormErrors } from "@/lib/form-errors";
import { ADDON_GROUPS, type AddOnGroupKey } from "@/lib/menu-data";

export type AddOnFormValues = { group: string; name: string; price: string; active: boolean };

export type AddOnFormState = {
  errors: Partial<Record<keyof AddOnFormValues | "form", string>>;
  values: AddOnFormValues;
};

function parseAddOnForm(formData: FormData): { values: AddOnFormValues; errors: AddOnFormState["errors"]; data?: AddOnInput } {
  const text = (key: string) => String(formData.get(key) ?? "").trim();
  const values: AddOnFormValues = {
    group: text("group"),
    name: text("name"),
    price: text("price"),
    active: formData.get("active") === "on",
  };

  const errors: AddOnFormState["errors"] = {};
  const group = ADDON_GROUPS.find((g) => g.key === values.group)?.key as AddOnGroupKey | undefined;
  if (!group) errors.group = "សូមជ្រើសរើសក្រុម។";
  if (values.name.length < 2) errors.name = "សូមបញ្ចូលឈ្មោះ។";
  else if (values.name.length > 60) errors.name = "ឈ្មោះវែងពេក (អតិបរមា 60 តួអក្សរ)។";
  const price = Number(values.price);
  if (!values.price || !Number.isFinite(price) || price < 0 || price > 100) {
    errors.price = "តម្លៃត្រូវតែជាលេខចន្លោះ 0 ដល់ 100 ដុល្លារ។";
  }

  if (Object.keys(errors).length > 0 || !group) return { values, errors };
  return { values, errors, data: { group, name: values.name, price, active: values.active } };
}

function refresh() {
  revalidatePath("/", "layout");
}

/** Backend validation keys → form fields. */
const formFieldFor = (field: string) => (["group", "name", "price"] as const).find((f) => f === field);

export async function createAddOnAction(_prev: AddOnFormState, formData: FormData): Promise<AddOnFormState> {
  const { values, errors, data } = parseAddOnForm(formData);
  if (!data) return { values, errors };
  try {
    await addAddOn(data);
  } catch (err) {
    return { values, errors: toFormErrors(err, formFieldFor) };
  }
  refresh();
  redirect("/admin/add-ons?notice=created");
}

export async function updateAddOnAction(id: string, _prev: AddOnFormState, formData: FormData): Promise<AddOnFormState> {
  const { values, errors, data } = parseAddOnForm(formData);
  if (!data) return { values, errors };
  try {
    await updateAddOn(id, data);
  } catch (err) {
    return { values, errors: toFormErrors(err, formFieldFor) };
  }
  refresh();
  redirect("/admin/add-ons?notice=updated");
}

export async function setAddOnActiveAction(id: string, active: boolean) {
  await setAddOnActive(id, active);
  refresh();
}

export async function deleteAddOnAction(id: string) {
  await deleteAddOn(id);
  refresh();
}
