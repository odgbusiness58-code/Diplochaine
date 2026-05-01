import { api } from "@/lib/api/client";
import type { University } from "@/lib/api/types";

export const universitiesApi = {
  list: () => api.get<University[]>("/universities/", { auth: false }),
  get: (id: number) => api.get<University>(`/universities/${id}/`, { auth: false }),
};
