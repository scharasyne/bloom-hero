import { test, expect } from "../../fixtures";
import { skipWithoutAuth } from "../../helpers/auth-guard";

test.describe("Vendor management (Book1 TC-SP1-005 – TC-SP1-007)", () => {
  skipWithoutAuth("admin");

  test.beforeEach(async ({ adminVendorsPage }) => {
    await adminVendorsPage.goto();
  });

  test("TC-SP1-005 vendors table and filters", async ({ adminVendorsPage }) => {
    await expect(adminVendorsPage.heading()).toBeVisible();
    await expect(adminVendorsPage.searchInput()).toBeVisible();
    await expect(adminVendorsPage.page.getByRole("button", { name: /all types/i })).toBeVisible();
  });

  test("TC-SP1-006 status badges when vendors exist", async ({ adminVendorsPage }) => {
    const badges = adminVendorsPage.page.locator("span").filter({
      hasText: /^(Verified|Pending|Suspended)$/,
    });
    const count = await badges.count();
    if (count === 0) {
      test.skip(true, "No vendors in test database");
      return;
    }
    await expect(badges.first()).toBeVisible();
  });

  test("TC-SP1-007 search filters vendor list", async ({ adminVendorsPage }) => {
    await adminVendorsPage.searchInput().fill("zzz-no-match-xyz");
    await expect(adminVendorsPage.page.getByText("No vendors found")).toBeVisible();
  });
});
