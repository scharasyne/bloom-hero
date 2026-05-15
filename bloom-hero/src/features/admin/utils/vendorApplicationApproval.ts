import { randomBytes } from "crypto";

export function normalizeEmail(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

export function createRandomPassword(length = 16) {
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
  const bytes = randomBytes(length);
  return Array.from(bytes, (byte) => charset[byte % charset.length]).join("");
}

export type LinkedVendorCredentials = {
  vendor_user_id: string;
  email: string;
  password: string;
  issued_at: string;
};
