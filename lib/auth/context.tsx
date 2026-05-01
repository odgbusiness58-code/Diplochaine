"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

import { authApi } from "@/lib/api/auth";
import type { LoginPayload, RegisterPayload, University } from "@/lib/api/types";
import { clearSession, getStoredUniversity, saveSession } from "@/lib/auth/storage";

interface AuthContextValue {
  university: University | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [university, setUniversity] = useState<University | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredUniversity();
    if (stored) setUniversity(stored);
    setIsLoading(false);
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const res = await authApi.login(payload);
    saveSession({ access: res.access, refresh: res.refresh });
    const uni = res.university ?? await authApi.profile().catch(() => null);
    if (uni) saveSession({ access: res.access, refresh: res.refresh }, uni);
    setUniversity(uni ?? null);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const res = await authApi.register(payload);
    saveSession(res.tokens, res.university);
    setUniversity(res.university);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUniversity(null);
    router.push("/");
  }, [router]);

  const refresh = useCallback(async () => {
    try {
      const profile = await authApi.profile();
      setUniversity(profile);
      const stored = JSON.stringify(profile);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("diplochain.university", stored);
      }
    } catch {
      clearSession();
      setUniversity(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      university,
      isAuthenticated: !!university,
      isLoading,
      login,
      register,
      logout,
      refresh,
    }),
    [university, isLoading, login, register, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
