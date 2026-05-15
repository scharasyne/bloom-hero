import { test, expect } from "@playwright/test";
import { PUBLIC_ROUTES } from "../../helpers/routes";

test.describe("Public routes smoke", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route.path} loads`, async ({ page }) => {
      const response = await page.goto(route.path);
      expect(response?.status()).toBeLessThan(500);

      if (route.path === "/login") {
        await expect(page.getByAltText("BloomHero Logo")).toBeVisible();
        await expect(page.getByTestId("login-email")).toBeVisible();
        await expect(page.getByTestId("login-password")).toBeVisible();
        await expect(page.getByTestId("login-submit")).toBeVisible();
        return;
      }

      if ("title" in route && route.title) {
        await expect(page).toHaveTitle(route.title);
      }
    });
  }
});
