import { ApiError } from "@/lib/api/types";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  updateAccessToken,
} from "@/lib/auth/storage";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "/api/proxy").replace(/\/$/, "");

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  formData?: FormData;
  auth?: boolean;
  signal?: AbortSignal;
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/auth/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });

      if (!res.ok) {
        clearSession();
        return null;
      }

      const data = (await res.json()) as { access: string };
      updateAccessToken(data.access);
      return data.access;
    } catch {
      clearSession();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function buildHeaders(opts: RequestOptions): Promise<Headers> {
  const headers = new Headers();

  if (!opts.formData) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Accept", "application/json");

  if (opts.auth !== false) {
    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}

async function parseResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type") ?? "";
  let data: unknown = null;

  if (contentType.includes("application/json")) {
    data = await res.json().catch(() => null);
  } else if (contentType.startsWith("text/")) {
    data = await res.text().catch(() => null);
  }

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && "detail" in data && typeof (data as { detail: unknown }).detail === "string"
        ? (data as { detail: string }).detail
        : null) ??
      (typeof data === "string" ? data : null) ??
      `HTTP ${res.status}`;
    throw new ApiError(message, res.status, data);
  }

  return data as T;
}

export async function apiRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const url = `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const exec = async (retry = false): Promise<T> => {
    const headers = await buildHeaders(opts);
    const res = await fetch(url, {
      method: opts.method ?? "GET",
      headers,
      body: opts.formData ?? (opts.body !== undefined ? JSON.stringify(opts.body) : undefined),
      signal: opts.signal,
      cache: "no-store",
    });

    if (res.status === 401 && opts.auth !== false && !retry) {
      const newToken = await refreshAccessToken();
      if (newToken) return exec(true);
      clearSession();
    }

    return parseResponse<T>(res);
  };

  return exec();
}

export const api = {
  get: <T>(path: string, opts?: Omit<RequestOptions, "method" | "body" | "formData">) =>
    apiRequest<T>(path, { ...opts, method: "GET" }),
  post: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, "method" | "body">) =>
    apiRequest<T>(path, { ...opts, method: "POST", body }),
  postForm: <T>(path: string, formData: FormData, opts?: Omit<RequestOptions, "method" | "body" | "formData">) =>
    apiRequest<T>(path, { ...opts, method: "POST", formData }),
  patch: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, "method" | "body">) =>
    apiRequest<T>(path, { ...opts, method: "PATCH", body }),
  delete: <T>(path: string, opts?: Omit<RequestOptions, "method" | "body" | "formData">) =>
    apiRequest<T>(path, { ...opts, method: "DELETE" }),
};

export { API_URL };
