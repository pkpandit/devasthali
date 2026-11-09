export * from "./content";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: import("./content").Role;
}

export interface ActionResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}
