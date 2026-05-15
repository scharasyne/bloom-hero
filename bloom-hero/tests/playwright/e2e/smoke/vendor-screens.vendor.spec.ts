import { test, expect } from "@playwright/test";
import { skipWithoutAuth } from "../../helpers/auth-guard";
import { VENDOR_ROUTES } from "../../helpers/routes";

test.describe("Vendor screen smoke", () => {
  skipWithoutAuth("vendor");

  for (const route of VENDOR_ROUTES) {
    test(`${route.path} loads for vendor`, async ({ page }) => {
      const response = await page.goto(route.path);
      expect(response?.status()).toBeLessThan(500);
      await expect(page).not.toHaveURL(/\/login/);
      if (route.heading) {
        await expect(page.getByRole("heading", { name: route.heading })).toBeVisible();
      }
    });
  }
});
