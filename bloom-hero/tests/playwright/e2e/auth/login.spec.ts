import { test, expect } from "../../fixtures";
import { getInvalidPassword, getRoleCredentials } from "../../helpers/env";
import { ROLE_HOME } from "../../helpers/routes";
import { E2E_CREDENTIALS } from "../../test-data/credentials";

test.describe("Login flow (Book1 TC-SP1-001, TC-SP1-061 – TC-SP1-064)", () => {
  test("TC-SP1-001 shared login screen", async ({ loginPage }) => {
    await loginPage.goto();
    await expect(loginPage.logo()).toBeVisible();
    await expect(loginPage.emailInput()).toBeVisible();
    await expect(loginPage.passwordInput()).toBeVisible();
    await expect(loginPage.submitButton()).toHaveText(/sign in/i);
    await expect(loginPage.forgotPasswordLink()).toBeVisible();
    await expect(loginPage.googleButton()).toBeVisible();
    await expect(loginPage.signUpLink()).toBeVisible();
  });

  test("TC-SP1-063 incorrect password", async ({ loginPage }) => {
    const { email } = E2E_CREDENTIALS.customer;
    await loginPage.login(email, getInvalidPassword());
    await expect(loginPage.statusMessage()).toContainText(/invalid login credentials/i);
    await expect(loginPage.page).toHaveURL(/\/login/);
  });

  test("TC-SP1-064 unknown email", async ({ loginPage }) => {
    await loginPage.login("no-such-user@bloomhero.test", getInvalidPassword());
    await expect(loginPage.statusMessage()).toBeVisible();
    await expect(loginPage.page).toHaveURL(/\/login/);
  });
});

test.describe("Role-based login redirects (Book1 TC-SP1-061 – TC-SP1-062)", () => {
  test("admin → /admin/dashboard", async ({ loginPage }) => {
    const creds = getRoleCredentials("admin");
    await loginPage.login(creds.email, creds.password);
    await expect(loginPage.page).toHaveURL(ROLE_HOME.admin);
  });

  test("registered vendor → /vendor/dashboard", async ({ loginPage }) => {
    const creds = getRoleCredentials("vendor");
    await loginPage.login(creds.email, creds.password);
    await expect(loginPage.page).toHaveURL(ROLE_HOME.vendor);
  });

  test("unregistered vendor → /vendor/dashboard", async ({ loginPage }) => {
    const creds = getRoleCredentials("unregistered");
    await loginPage.login(creds.email, creds.password);
    await expect(loginPage.page).toHaveURL(ROLE_HOME.unregistered);
  });

  test("customer → home or dashboard", async ({ loginPage }) => {
    const creds = getRoleCredentials("customer");
    await loginPage.login(creds.email, creds.password);
    await expect(loginPage.page).toHaveURL(ROLE_HOME.customer);
  });
});
