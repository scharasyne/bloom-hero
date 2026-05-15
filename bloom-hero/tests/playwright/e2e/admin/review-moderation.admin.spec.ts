import { test, expect } from "../../fixtures";
import { skipWithoutAuth } from "../../helpers/auth-guard";

test.describe("Review moderation (Book1 TC-SP1-008)", () => {
  skipWithoutAuth("admin");

  test.beforeEach(async ({ adminReviewPage }) => {
    await adminReviewPage.goto();
  });

  test("TC-SP1-008 moderation tabs and summary", async ({ adminReviewPage }) => {
    await expect(adminReviewPage.heading()).toBeVisible();
    await expect(adminReviewPage.pendingTab()).toBeVisible();
    await expect(adminReviewPage.approvedTab()).toBeVisible();
    await expect(adminReviewPage.rejectedTab()).toBeVisible();
    await expect(adminReviewPage.page.getByText(/pending \|/i)).toBeVisible();
  });
});
