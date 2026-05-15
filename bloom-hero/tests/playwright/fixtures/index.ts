import { test as base, expect } from "@playwright/test";
import { hasRoleCredentials, type E2ERole } from "../helpers/env";
import { LoginPage } from "../pages/LoginPage";
import { CustomerOrdersPage } from "../pages/CustomerOrdersPage";
import { AdminVendorsPage } from "../pages/AdminVendorsPage";
import { AdminVendorApplicationsPage } from "../pages/AdminVendorApplicationsPage";
import { AdminReviewModerationPage } from "../pages/AdminReviewModerationPage";

type Fixtures = {
  loginPage: LoginPage;
  customerOrdersPage: CustomerOrdersPage;
  adminVendorsPage: AdminVendorsPage;
  adminApplicationsPage: AdminVendorApplicationsPage;
  adminReviewPage: AdminReviewModerationPage;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  customerOrdersPage: async ({ page }, use) => {
    await use(new CustomerOrdersPage(page));
  },
  adminVendorsPage: async ({ page }, use) => {
    await use(new AdminVendorsPage(page));
  },
  adminApplicationsPage: async ({ page }, use) => {
    await use(new AdminVendorApplicationsPage(page));
  },
  adminReviewPage: async ({ page }, use) => {
    await use(new AdminReviewModerationPage(page));
  },
});

export { expect };

export function requireCredentials(role: E2ERole) {
  test.skip(!hasRoleCredentials(role), `Set E2E_${role.toUpperCase()}_EMAIL and E2E_${role.toUpperCase()}_PASSWORD`);
}
