export type Role = "SUPER_ADMIN" | "PRINCIPAL" | "ADMISSIONS_OFFICER" | "TEACHER" | "STAFF";

export type AdmissionType = "DAY_SCHOLAR" | "RESIDENTIAL_BOARDER";

export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "CAMPUS_VISIT_BOOKED"
  | "EVALUATED"
  | "ADMISSION_OFFERED"
  | "ENROLLED"
  | "REJECTED";

export type NoticeCategory = "CIRCULAR" | "EXAMINATION" | "ADMISSION" | "EVENT";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface ActionResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}
