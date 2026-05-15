import { test, expect } from "@playwright/test";

test.describe("Forgot password flow (Book1)", () => {
  test("forgot password page loads", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.getByAltText("BloomHero Logo")).toBeVisible();
  });
});
