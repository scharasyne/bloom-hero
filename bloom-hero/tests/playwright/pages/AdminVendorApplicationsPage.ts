import type { Page } from "@playwright/test";

export class AdminVendorApplicationsPage {
  constructor(readonly page: Page) {}

  async goto() {
    await this.page.goto("/admin/vendor-applications");
  }

  heading() {
    return this.page.getByRole("heading", { name: "Vendor Applications" });
  }

  approveSelectedButton() {
    return this.page.getByRole("button", { name: /approve selected/i });
  }

  rejectAllButton() {
    return this.page.getByRole("button", { name: /reject all/i });
  }

  selectAllButton() {
    return this.page.getByRole("button", { name: /select all/i });
  }
}
