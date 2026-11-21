import crypto from "crypto";

export function computeSaltedIpHash(clientIp?: string | null): string {
  const ip = clientIp?.trim() || "unknown";
  const salt = process.env.ENQUIRY_SALT || "dvp_admissions_enquiry_salt_2026";
  return crypto.createHash("sha256").update(`${ip}:${salt}`).digest("hex").slice(0, 32);
}
