import { test, expect } from "../../fixtures";
import { skipWithoutAuth } from "../../helpers/auth-guard";

test.describe("Vendor applications queue (Book1 TC-SP1-002 – TC-SP1-004)", () => {
  skipWithoutAuth("admin");

  test.beforeEach(async ({ adminApplicationsPage }) => {
    await adminApplicationsPage.goto();
  });

  test("TC-SP1-002 queue header and bulk actions", async ({ adminApplicationsPage }) => {
    await expect(adminApplicationsPage.heading()).toBeVisible();
    await expect(adminApplicationsPage.page.getByText(/pending applications/i)).toBeVisible();
    await expect(adminApplicationsPage.approveSelectedButton()).toBeVisible();
    await expect(adminApplicationsPage.rejectAllButton()).toBeVisible();
    await expect(adminApplicationsPage.selectAllButton()).toBeVisible();
  });

  test("TC-SP1-003 document controls on application cards when data exists", async ({
    adminApplicationsPage,
  }) => {
    const viewDocs = adminApplicationsPage.page.getByRole("button", { name: /view documents/i });
    const count = await viewDocs.count();
    if (count === 0) {
      test.skip(true, "No pending applications in test database");
      return;
    }
    await expect(viewDocs.first()).toBeVisible();
    await viewDocs.first().click();
    await expect(
      adminApplicationsPage.page.getByRole("button", { name: /hide documents/i })
    ).toBeVisible();
  });

  test("TC-SP1-004 approve and reject controls on cards when data exists", async ({
    adminApplicationsPage,
  }) => {
    const approve = adminApplicationsPage.page.getByRole("button", { name: /^approve$/i });
    const reject = adminApplicationsPage.page.getByRole("button", { name: /^reject$/i });
    const count = await approve.count();
    if (count === 0) {
      test.skip(true, "No pending applications in test database");
      return;
    }
    await expect(approve.first()).toBeVisible();
    await expect(reject.first()).toBeVisible();
    await reject.first().click();
    await expect(
      adminApplicationsPage.page.getByRole("button", { name: /confirm reject/i })
    ).toBeVisible();
  });
});
