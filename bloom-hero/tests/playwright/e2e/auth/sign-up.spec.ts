import { test, expect } from "@playwright/test";

test.describe("Customer registration UI (Book1)", () => {
  test("sign-up page shows registration form", async ({ page }) => {
    await page.goto("/sign-up");
    await expect(page.getByAltText("BloomHero Logo")).toBeVisible();
    await expect(page.getByRole("link", { name: /log in|sign in/i })).toBeVisible();
  });
});
