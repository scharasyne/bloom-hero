import { test, expect } from "@playwright/test";
import { LEGACY_VENDOR_REDIRECTS } from "../../helpers/routes";

test.describe("Legacy /market and /pop-up URLs redirect to /vendor/*", () => {
  for (const legacyPath of LEGACY_VENDOR_REDIRECTS) {
    test(`${legacyPath}`, async ({ page }) => {
      await page.goto(legacyPath);
      await expect(page).toHaveURL(/\/vendor\//);
    });
  }
});
