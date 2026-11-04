"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { updateExchangeRate } from "@/lib/exchange-rate";
import { toFormErrors } from "@/lib/form-errors";

export type RateFormState = {
  errors: Partial<Record<"khrPerUsd" | "form", string>>;
  values: { khrPerUsd: string };
};

// "use server" files may only export async functions, so the limits stay private.
const MIN_RATE = 1000;
const MAX_RATE = 10000;

export async function updateExchangeRateAction(_prev: RateFormState, formData: FormData): Promise<RateFormState> {
  // Accept "4,100" as typed by a person.
  const raw = String(formData.get("khrPerUsd") ?? "").replace(/[,\s៛]/g, "").trim();
  const values = { khrPerUsd: raw };
  const rate = Number(raw);

  if (!raw || !Number.isInteger(rate) || rate < MIN_RATE || rate > MAX_RATE) {
    return { values, errors: { khrPerUsd: "អត្រាត្រូវតែជាលេខគត់ចន្លោះ 1,000 ដល់ 10,000 រៀល។" } };
  }

  try {
    await updateExchangeRate(rate);
  } catch (err) {
    return { values, errors: toFormErrors(err, (f) => (f === "khrPerUsd" ? "khrPerUsd" : undefined)) };
  }

  // Every price on the site shows riel — refresh the menu and the admin pages.
  revalidatePath("/", "layout");
  redirect("/admin/settings?notice=updated");
}
