import { E2E_CREDENTIALS, type E2EAccountKey } from "../test-data/credentials";

export type E2ERole = E2EAccountKey;

export function getBaseURL(): string {
  return process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
}

export function getRoleCredentials(role: E2ERole): { email: string; password: string } {
  const fromEnv = {
    email: process.env[`E2E_${role.toUpperCase()}_EMAIL`],
    password: process.env[`E2E_${role.toUpperCase()}_PASSWORD`],
  };
  if (fromEnv.email && fromEnv.password) {
    return { email: fromEnv.email, password: fromEnv.password };
  }
  return E2E_CREDENTIALS[role];
}

export function hasRoleCredentials(_role: E2ERole): boolean {
  return true;
}

export function getInvalidPassword(): string {
  return process.env.E2E_INVALID_PASSWORD ?? "wrong-password-123";
}
