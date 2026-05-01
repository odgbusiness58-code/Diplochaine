import type { AuthTokens, University } from "@/lib/api/types";

const ACCESS_KEY = "diplochain.access";
const REFRESH_KEY = "diplochain.refresh";
const UNIVERSITY_KEY = "diplochain.university";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getAccessToken(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(REFRESH_KEY);
}

export function getStoredUniversity(): University | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(UNIVERSITY_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as University;
  } catch {
    return null;
  }
}

export function saveSession(tokens: AuthTokens, university?: University): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(ACCESS_KEY, tokens.access);
  window.localStorage.setItem(REFRESH_KEY, tokens.refresh);
  if (university) {
    window.localStorage.setItem(UNIVERSITY_KEY, JSON.stringify(university));
  }
}

export function updateAccessToken(access: string): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(ACCESS_KEY, access);
}

export function clearSession(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(ACCESS_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
  window.localStorage.removeItem(UNIVERSITY_KEY);
}
