import { test, expect } from "../../fixtures";
import { skipWithoutAuth } from "../../helpers/auth-guard";

test.describe("Admin dashboard (Book1 TC-SP1-001 – TC-SP1-008)", () => {
  skipWithoutAuth("admin");

  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/dashboard");
  });

  test("TC-SP1-001 dashboard loads with admin tasks", async ({ page }) => {
    await expect(page.getByText("Approve vendor applications")).toBeVisible();
    await expect(page.getByText("Approve customer reviews")).toBeVisible();
  });

  test("TC-SP1-002 vendor applications reachable from nav", async ({ page }) => {
    await page.getByRole("link", { name: "Vendor Applications" }).click();
    await expect(page).toHaveURL(/\/admin\/vendor-applications/);
    await expect(page.getByRole("heading", { name: "Vendor Applications" })).toBeVisible();
  });

  test("TC-SP1-005 vendor management table route", async ({ page }) => {
    await page.getByRole("link", { name: "Vendors" }).click();
    await expect(page).toHaveURL(/\/admin\/vendors/);
    await expect(page.getByRole("heading", { name: "Vendors" })).toBeVisible();
  });

  test("TC-SP1-007 search and filters on vendors page", async ({ adminVendorsPage }) => {
    await adminVendorsPage.goto();
    await expect(adminVendorsPage.searchInput()).toBeVisible();
    await expect(adminVendorsPage.page.getByRole("button", { name: /all types/i })).toBeVisible();
  });

  test("TC-SP1-008 review moderation panel route", async ({ page }) => {
    await page.getByRole("link", { name: "Reviews" }).click();
    await expect(page).toHaveURL(/\/admin\/review-moderation/);
    await expect(page.getByRole("heading", { name: "Review Moderation" })).toBeVisible();
  });
});
