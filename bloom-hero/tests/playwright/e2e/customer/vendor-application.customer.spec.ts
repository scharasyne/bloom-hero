import { test, expect } from "@playwright/test";
import { skipWithoutAuth } from "../../helpers/auth-guard";

test.describe("Vendor registration (Book1 Vendor Registration)", () => {
  skipWithoutAuth("customer");

  test("customer can open vendor application page", async ({ page }) => {
    await page.goto("/vendor-application");
    await expect(page).not.toHaveURL(/\/login/);
  });
});
