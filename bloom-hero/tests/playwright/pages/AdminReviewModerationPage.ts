import type { Page } from "@playwright/test";

export class AdminReviewModerationPage {
  constructor(readonly page: Page) {}

  async goto() {
    await this.page.goto("/admin/review-moderation");
  }

  heading() {
    return this.page.getByRole("heading", { name: "Review Moderation" });
  }

  pendingTab() {
    return this.page.getByRole("button", { name: /^Pending/i });
  }

  approvedTab() {
    return this.page.getByRole("button", { name: /^Approved/i });
  }

  rejectedTab() {
    return this.page.getByRole("button", { name: /^Rejected/i });
  }
}
