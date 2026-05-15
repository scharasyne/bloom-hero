import type { Page } from "@playwright/test";

export class AdminVendorsPage {
  constructor(readonly page: Page) {}

  async goto() {
    await this.page.goto("/admin/vendors");
  }

  heading() {
    return this.page.getByRole("heading", { name: "Vendors" });
  }

  searchInput() {
    return this.page.getByPlaceholder("Search vendors...");
  }
}
