import { test, expect } from "@playwright/test";
import { skipWithoutAuth } from "../../helpers/auth-guard";
import { ADMIN_ROUTES } from "../../helpers/routes";
const ADMIN_NAV_LABELS = [
  "Dashboard",
  "Vendor Applications",
  "Vendors",
  "Reviews",
  "Activity Logs",
];

test.describe("Admin screen smoke", () => {
  skipWithoutAuth("admin");

  for (const route of ADMIN_ROUTES) {
    test(`${route.path} loads`, async ({ page }) => {
      await page.goto(route.path);
      if (route.heading) {
        await expect(page.getByRole("heading", { name: route.heading })).toBeVisible();
      }
    });
  }

  test("sidebar navigation links are present", async ({ page }) => {
    await page.goto("/admin/dashboard");
    for (const label of ADMIN_NAV_LABELS) {
      await expect(page.getByRole("link", { name: label })).toBeVisible();
    }
  });
});
