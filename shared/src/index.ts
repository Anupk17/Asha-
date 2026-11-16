export const SHARED_VERSION = "0.2.0";

export type BeneficiaryType = "pregnant" | "newborn" | "child";

export interface GeoLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}

export interface Beneficiary {
  id: string;
  code: string; // e.g. 'SYN-0001'
  name: string;
  type: BeneficiaryType;
  village: string;
  language: string;
  date_of_birth?: string;
  expected_delivery_date?: string;
  home_geo?: GeoLocation;
  created_at: string;
}

export type VisitType = "ANC" | "PNC" | "newborn" | "immunisation";

export interface Visit {
  id: string;
  beneficiary_id: string;
  beneficiary_name?: string;
  beneficiary_code?: string;
  village?: string;
  visit_type: VisitType;
  weight_kg?: number;
  temperature_c?: number;
  breaths_per_min?: number;
  vaccinations_due: string[];
  next_visit_date?: string;
  danger_flags: string[];
  danger_unknowns: string[];
  rules_version: string;
  geo?: GeoLocation;
  status: "confirmed" | "draft";
  created_at: string;
  confirmed_at?: string;
}

export interface FollowUp {
  id: string;
  visit_id?: string;
  beneficiary_id: string;
  beneficiary_name: string;
  beneficiary_code: string;
  village: string;
  type: string;
  due_date: string; // YYYY-MM-DD
  status: "pending" | "done" | "overdue" | "cancelled";
  source: "visit_record" | "guideline_schedule";
  guideline_ref?: string;
  is_danger_referral?: boolean;
  created_at: string;
  completed_at?: string;
}

export interface AuditLog {
  id: string;
  event: string;
  detail: Record<string, any> | string;
  at: string;
}

export type SupportedLanguage = "en" | "hi" | "ta" | "te" | "kn" | "ml" | "mr";

export interface UserSettings {
  language: SupportedLanguage;
  noise_mode: boolean;
  show_latency: boolean;
  location_sharing: boolean;
  location_precision: "exact" | "village";
  reminder_time: string;
}

export * from './vocab.js';
export * from './danger/engine.js';
export * from './normalisers/numbers.js';
export * from './normalisers/dates.js';
export * from './normalisers/corrections.js';
