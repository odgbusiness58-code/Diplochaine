export type DiplomaStatus = "draft" | "signed" | "revoked";

export interface University {
  id: number;
  name: string;
  acronym?: string;
  country: string;
  city?: string;
  website?: string;
  email?: string;
  is_verified: boolean;
  diploma_count?: number;
  blockchain_address?: string;
  blockchain_public_key?: string;
  rsa_public_key_pem?: string;
  fingerprint?: string;
  created_at?: string;
}

export interface UniversityKeys {
  blockchain_address: string;
  blockchain_public_key: string;
  blockchain_private_key: string;
  rsa_public_key_pem: string;
  rsa_private_key_pem: string;
  fingerprint: string;
}

export interface Diploma {
  id: string;
  university: number | University;
  student_full_name: string;
  student_birth_date: string;
  student_id_number?: string;
  diploma_title: string;
  field_of_study?: string;
  graduation_date: string;
  mention?: string;
  status: DiplomaStatus;
  hash?: string;
  rsa_signature?: string;
  eth_signature?: string;
  pdf_url?: string;
  issued_at?: string;
  revoked_at?: string;
  revocation_reason?: string;
}

export interface IssueDiplomaPayload {
  student_first_name: string;
  student_last_name: string;
  student_birth_date: string;
  student_id_number?: string;
  degree_title: string;
  field_of_study?: string;
  graduation_date: string;
  mention?: string;
}

export interface RegisterPayload {
  name: string;
  acronym?: string;
  country: string;
  city?: string;
  website?: string;
  email: string;
  password: string;
  password_confirm: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse extends AuthTokens {
  university: University;
}

export interface VerifyResult {
  valid: boolean;
  diploma?: Diploma;
  university?: University;
  reason?: string;
  checks?: {
    hash_match?: boolean;
    rsa_signature_valid?: boolean;
    eth_signature_valid?: boolean;
    fingerprint_consistent?: boolean;
    not_revoked?: boolean;
  };
}

export interface ScanVerifyResult {
  valid: boolean;
  reason?: string;
  message?: string;
  revocation_reason?: string;
  diploma?: {
    id: string;
    student: string;
    degree: string;
    field?: string;
    mention?: string;
    year?: number;
    issued_at?: string;
  };
  university?: {
    name: string;
    acronym?: string;
    is_verified: boolean;
  };
  blockchain?: {
    anchored: boolean;
    tx_hash?: string;
  };
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}
