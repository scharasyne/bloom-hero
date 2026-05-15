import { test, expect } from "@playwright/test";
import { PROXY_PROTECTED_ROUTES } from "../../helpers/routes";

test.describe("Unauthenticated access to protected routes", () => {
  for (const path of PROXY_PROTECTED_ROUTES) {
    test(`${path} redirects to login (TC-SP1-065)`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login/);
    });
  }

  test("/vendor/dashboard redirects unauthenticated users", async ({ page }) => {
    await page.goto("/vendor/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});
