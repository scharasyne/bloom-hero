import { test, expect } from "@playwright/test";
import { skipWithoutAuth } from "../../helpers/auth-guard";

test.describe("Session persistence (TC-SP1-068)", () => {
  skipWithoutAuth("customer");

  test("refresh keeps customer on orders page", async ({ page }) => {
    await page.goto("/orders");
    await expect(page.getByRole("heading", { name: "Purchase History" })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("heading", { name: "Purchase History" })).toBeVisible();
    await expect(page).not.toHaveURL(/\/login/);
  });
});
