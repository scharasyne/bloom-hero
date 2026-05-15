import { test, expect } from "@playwright/test";

test.describe("Vendor map /map (Book1 Vendor map module)", () => {
  test("map page loads (public)", async ({ page }) => {
    await page.goto("/map");
    await expect(page).toHaveTitle(/pop-up map/i);
  });
});
