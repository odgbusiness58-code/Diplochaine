import { api } from "@/lib/api/client";
import type {
  AuthTokens,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  University,
  UniversityKeys,
} from "@/lib/api/types";

export const authApi = {
  register: (payload: RegisterPayload) =>
    api.post<{ university: University; tokens: AuthTokens; keys?: UniversityKeys }>(
      "/auth/register/",
      payload,
      { auth: false }
    ),

  login: (payload: LoginPayload) =>
    api.post<LoginResponse>("/auth/login/", payload, { auth: false }),

  refresh: (refresh: string) =>
    api.post<{ access: string }>("/auth/token/refresh/", { refresh }, { auth: false }),

  profile: () => api.get<University>("/auth/profile/"),

  keys: () => api.get<UniversityKeys>("/auth/keys/"),
};
