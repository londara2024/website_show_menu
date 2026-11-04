"use server";

import { redirect } from "next/navigation";
import { ApiError, BackendUnavailableError, apiFetch } from "./api";
import { clearSession, setSession } from "./session";

type TokenResponse = {
  token: string;
  expiresAt: string;
  user: { id: string; email: string; fullName: string; role: "ADMIN" | "CUSTOMER" };
};

export type LoginState = {
  errors: Partial<Record<"email" | "password" | "form", string>>;
  values: { email: string; remember: boolean };
};

export type RegisterState = {
  errors: Partial<Record<"name" | "email" | "password" | "confirm" | "terms" | "form", string>>;
  values: { name: string; email: string; terms: boolean };
};

const EMAIL_RE = /^\S+@\S+\.\S+$/;

/** Only same-site paths, so ?next= can't be used as an open redirect. */
function safeNext(next: FormDataEntryValue | null): string | undefined {
  const path = typeof next === "string" ? next : "";
  return path.startsWith("/") && !path.startsWith("//") && !path.startsWith("/\\") ? path : undefined;
}

function unavailableOr<T extends { form?: string }>(err: unknown, fallback: T): T {
  if (err instanceof BackendUnavailableError) return { form: err.message } as T;
  return fallback;
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const remember = formData.get("remember") === "on";
  const values = { email, remember };

  const errors: LoginState["errors"] = {};
  if (!EMAIL_RE.test(email)) errors.email = "សូមបញ្ចូលអ៊ីមែលឲ្យបានត្រឹមត្រូវ។";
  if (!password) errors.password = "សូមបញ្ចូលពាក្យសម្ងាត់។";
  if (Object.keys(errors).length) return { errors, values };

  let res: TokenResponse;
  try {
    res = await apiFetch<TokenResponse>("/api/auth/login", { method: "POST", body: { email, password } });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      return { errors: { form: "អ៊ីមែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ។" }, values };
    }
    if (err instanceof ApiError && err.status === 400) {
      return { errors: { email: err.fieldErrors.email, password: err.fieldErrors.password, form: err.message }, values };
    }
    return { errors: unavailableOr(err, { form: "ចូលគណនីមិនបានទេ។ សូមព្យាយាមម្ដងទៀត។" }), values };
  }

  await setSession(res.token, res.expiresAt, remember);
  // Everyone goes to the dashboard (or back to the page they came from). Customers see it
  // view-only; the API only lets ADMIN change the menu.
  redirect(safeNext(formData.get("next")) ?? "/admin");
}

export async function registerAction(_prev: RegisterState, formData: FormData): Promise<RegisterState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const terms = formData.get("terms") === "on";
  const values = { name, email, terms };

  const errors: RegisterState["errors"] = {};
  if (name.length < 2) errors.name = "សូមបញ្ចូលឈ្មោះរបស់អ្នក។";
  if (!EMAIL_RE.test(email)) errors.email = "សូមបញ្ចូលអ៊ីមែលឲ្យបានត្រឹមត្រូវ។";
  if (password.length < 8) errors.password = "ប្រើយ៉ាងហោចណាស់ 8 តួអក្សរ។";
  else if (password.length > 72) errors.password = "ពាក្យសម្ងាត់វែងពេក (អតិបរមា 72 តួអក្សរ)។";
  if (confirm !== password) errors.confirm = "ពាក្យសម្ងាត់មិនដូចគ្នាទេ។";
  if (!terms) errors.terms = "សូមយល់ព្រមលើលក្ខខណ្ឌដើម្បីបន្ត។";
  if (Object.keys(errors).length) return { errors, values };

  try {
    await apiFetch("/api/auth/register", { method: "POST", body: { fullName: name, email, password } });
  } catch (err) {
    if (err instanceof ApiError && (err.status === 409 || err.status === 400)) {
      const f = err.fieldErrors;
      return {
        errors: { name: f.fullName, email: f.email, password: f.password, ...(!Object.keys(f).length && { form: err.message }) },
        values,
      };
    }
    return { errors: unavailableOr(err, { form: "បង្កើតគណនីមិនបានទេ។ សូមព្យាយាមម្ដងទៀត។" }), values };
  }

  redirect("/login?registered=1");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}
