import "server-only";

/**
 * Thin client for the Spring Boot API (../backend). Only ever called from the Next.js
 * server — the browser never talks to the backend directly, and the JWT never reaches
 * client JavaScript.
 */
const BACKEND_URL = (process.env.BACKEND_URL ?? "http://localhost:8080").replace(/\/$/, "");

/** Non-2xx response from the backend. `message`/`fieldErrors` are Khmer and safe to show. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly fieldErrors: Record<string, string> = {},
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** The backend couldn't be reached at all (down, wrong BACKEND_URL, network). */
export class BackendUnavailableError extends Error {
  constructor(cause: unknown) {
    super("មិនអាចភ្ជាប់ទៅម៉ាស៊ីនមេបានទេ។ សូមព្យាយាមម្ដងទៀតនៅពេលក្រោយ។", { cause });
    this.name = "BackendUnavailableError";
  }
}

/** Public URL of the API, for server-side proxies (e.g. /uploads/*). */
export const backendUrl = (path: string) => BACKEND_URL + path;

type Options = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** JSON-serialised — or sent as multipart/form-data when it's a FormData (file uploads). */
  body?: unknown;
  /** Bearer token for authenticated calls. */
  token?: string;
  /** Query parameters; empty values are dropped. */
  query?: Record<string, string | undefined>;
};

export async function apiFetch<T>(path: string, { method = "GET", body, token, query }: Options = {}): Promise<T> {
  const url = new URL(BACKEND_URL + path);
  for (const [k, v] of Object.entries(query ?? {})) if (v) url.searchParams.set(k, v);

  // FormData sets its own multipart Content-Type (with the boundary), so don't override it.
  const isForm = body instanceof FormData;

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(body !== undefined && !isForm && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
      signal: AbortSignal.timeout(isForm ? 30_000 : 10_000),
    });
  } catch (err) {
    throw new BackendUnavailableError(err);
  }

  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(
      res.status,
      data?.message ?? `Backend error ${res.status}`,
      (data?.fieldErrors as Record<string, string> | undefined) ?? {},
    );
  }
  return data as T;
}
