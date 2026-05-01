import { api } from "@/lib/api/client";
import type { Diploma, IssueDiplomaPayload, ScanVerifyResult, VerifyResult } from "@/lib/api/types";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const diplomasApi = {
  issue: (payload: IssueDiplomaPayload) =>
    api.post<Diploma>("/diplomas/issue/", payload),

  listMine: () => api.get<Diploma[]>("/diplomas/"),

  get: (id: string) => api.get<Diploma>(`/diplomas/${id}/`, { auth: false }),

  revoke: (id: string, reason?: string) =>
    api.post<Diploma>(`/diplomas/${id}/revoke/`, { reason }),

  verifyByFile: (file: File) => {
    const fd = new FormData();
    fd.append("pdf_file", file);
    return api.postForm<VerifyResult>("/diplomas/verify/file/", fd, { auth: false });
  },

  verifyByHash: (hash: string) =>
    api.post<VerifyResult>("/diplomas/verify/hash/", { hash }, { auth: false }),

  verifyByScan: (diplomaId: string, studentLastName?: string) =>
    api.post<ScanVerifyResult>(
      "/diplomas/verify/scan/",
      { diploma_id: diplomaId, ...(studentLastName ? { student_last_name: studentLastName } : {}) },
      { auth: false }
    ),

  isUuid: (s: string) => UUID_RE.test(s.trim()),
};
