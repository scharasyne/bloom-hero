/**
 * E2E test accounts (Supabase). Used by Playwright global setup and specs.
 */
export const E2E_CREDENTIALS = {
  admin: { email: "test@admin.com", password: "admin" },
  customer: { email: "test@customer.com", password: "customer" },
  vendor: { email: "test@vendor.com", password: "vendor" },
  unregistered: { email: "test@unregistered.com", password: "unregistered" },
} as const;

export type E2EAccountKey = keyof typeof E2E_CREDENTIALS;
