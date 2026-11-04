import "server-only";

import { unstable_rethrow } from "next/navigation";
import { ApiError, BackendUnavailableError } from "./api";

const SAVE_FAILED = "រក្សាទុកមិនបានទេ។ សូមព្យាយាមម្ដងទៀត។";

/**
 * Turns an error from a backend call into form errors. Backend field keys such as
 * "sizes[1].price" are mapped onto form fields with `fieldFor`. Next.js redirects /
 * notFound are re-thrown untouched (an expired session redirects to /login).
 */
export function toFormErrors<K extends string>(
  err: unknown,
  fieldFor: (backendField: string) => K | undefined,
  notFoundMessage = "រកមិនឃើញធាតុនេះទេ (ប្រហែលជាត្រូវបានលុបរួចហើយ)។",
): Partial<Record<K | "form", string>> {
  unstable_rethrow(err);
  if (err instanceof BackendUnavailableError) return { form: err.message } as Partial<Record<K | "form", string>>;
  if (err instanceof ApiError) {
    if (err.status === 404) return { form: notFoundMessage } as Partial<Record<K | "form", string>>;
    const errors: Partial<Record<K | "form", string>> = {};
    for (const [field, message] of Object.entries(err.fieldErrors)) {
      const key = fieldFor(field) ?? "form";
      errors[key] ??= message;
    }
    if (Object.keys(errors).length === 0) errors.form = err.message || SAVE_FAILED;
    return errors;
  }
  console.error(err);
  return { form: SAVE_FAILED } as Partial<Record<K | "form", string>>;
}
