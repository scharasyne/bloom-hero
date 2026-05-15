import { test, expect } from "@playwright/test";

test.describe("Sign-up validation (Book1 Implement User Registration Logic)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/sign-up");
  });

  test("TC-SP1-079 rejects email with @@", async ({ page }) => {
    await page.getByTestId("signup-username").fill("testuser");
    await page.getByTestId("signup-email").fill("user@@example.com");
    await page.getByTestId("signup-password").fill("TestPass123!");
    await page.getByTestId("signup-confirm-password").fill("TestPass123!");
    await page.getByTestId("signup-submit").click();
    await expect(page.getByTestId("signup-status")).toContainText(/valid email/i);
  });

  test("TC-SP1-080 rejects email with !@", async ({ page }) => {
    await page.getByTestId("signup-username").fill("testuser");
    await page.getByTestId("signup-email").fill("!@invalid.com");
    await page.getByTestId("signup-password").fill("TestPass123!");
    await page.getByTestId("signup-confirm-password").fill("TestPass123!");
    await page.getByTestId("signup-submit").click();
    await expect(page.getByTestId("signup-status")).toContainText(/valid email/i);
  });

  test("TC-SP1-078 password mismatch", async ({ page }) => {
    await page.getByTestId("signup-username").fill("testuser");
    await page.getByTestId("signup-email").fill("valid@example.com");
    await page.getByTestId("signup-password").fill("abc");
    await page.getByTestId("signup-confirm-password").fill("xyz");
    await page.getByTestId("signup-submit").click();
    await expect(page.getByTestId("signup-status")).toContainText(/passwords do not match/i);
  });
});
