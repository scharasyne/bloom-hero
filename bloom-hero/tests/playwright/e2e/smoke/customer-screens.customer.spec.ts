import { test, expect } from "@playwright/test";
import { skipWithoutAuth } from "../../helpers/auth-guard";
import { CUSTOMER_ROUTES } from "../../helpers/routes";

test.describe("Customer screen smoke", () => {
  skipWithoutAuth("customer");

  for (const route of CUSTOMER_ROUTES) {
    test(`${route.path} loads for customer`, async ({ page }) => {
      await page.goto(route.path);
      await expect(page).not.toHaveURL(/\/login/);
      if (route.heading) {
        await expect(page.getByRole("heading", { name: route.heading })).toBeVisible();
      }
    });
  }
});
