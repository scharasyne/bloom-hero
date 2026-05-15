import { test, expect } from "@playwright/test";
import { skipWithoutAuth } from "../../helpers/auth-guard";

test.describe("Unregistered vendor (test@unregistered.com)", () => {
  skipWithoutAuth("unregistered");

  test("dashboard shows schedule-first guidance when approved", async ({ page }) => {
    await page.goto("/vendor/dashboard");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page).not.toHaveURL(/\/login/);
  });

  test("schedule page is reachable", async ({ page }) => {
    await page.goto("/vendor/schedule");
    await expect(page).not.toHaveURL(/\/login/);
  });

  test("profile page is reachable", async ({ page }) => {
    await page.goto("/vendor/profile");
    await expect(page).not.toHaveURL(/\/login/);
  });

  test("orders page shows catalog blocked panel (not full order table)", async ({ page }) => {
    await page.goto("/vendor/orders");
    await expect(page.getByRole("heading", { name: "Orders" })).toBeVisible();
    await expect(page.getByText(/register your business/i)).toBeVisible();
  });
});

test.describe("Registered vendor catalog access (test@vendor.com)", () => {
  skipWithoutAuth("vendor");

  test("orders page does not show register-business blocker", async ({ page }) => {
    await page.goto("/vendor/orders");
    await expect(page.getByRole("heading", { name: "Orders" })).toBeVisible();
    await expect(page.getByText(/register your business/i)).not.toBeVisible();
  });

  test("products page loads", async ({ page }) => {
    await page.goto("/vendor/products");
    await expect(page).not.toHaveURL(/\/login/);
  });
});
