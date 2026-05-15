import { test, expect } from "@playwright/test";
import { skipWithoutAuth } from "../../helpers/auth-guard";
test.describe("Admin RBAC (unified vendor model)", () => {
  skipWithoutAuth("admin");

  test("admin cannot access vendor dashboard", async ({ page }) => {
    await page.goto("/vendor/dashboard");
    await expect(page).toHaveURL(/\/admin\/dashboard/);
  });

  test("admin cannot access customer dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/admin\/dashboard/);
  });
});
