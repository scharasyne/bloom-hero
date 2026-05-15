import type { Page } from "@playwright/test";

export type TabKey = "to-pay" | "to-ship" | "to-receive" | "completed";

const TABS: { key: TabKey; label: string }[] = [
  { key: "to-pay", label: "To Pay" },
  { key: "to-ship", label: "To Ship" },
  { key: "to-receive", label: "To Receive" },
  { key: "completed", label: "Completed" },
];

const EMPTY_STATE: Record<TabKey, { heading: string }> = {
  "to-pay": { heading: "No pending payments" },
  "to-ship": { heading: "Nothing to ship yet" },
  "to-receive": { heading: "Nothing on the way yet" },
  completed: { heading: "No completed orders yet" },
};

export class CustomerOrdersPage {
  constructor(readonly page: Page) {}

  async goto(tab?: TabKey) {
    await this.page.goto(tab ? `/orders?tab=${tab}` : "/orders");
  }

  heading() {
    return this.page.getByRole("heading", { name: "Purchase History" });
  }

  tab(key: TabKey) {
    const label = TABS.find((t) => t.key === key)?.label ?? key;
    return this.page.getByRole("link", { name: label, exact: true });
  }

  async selectTab(key: TabKey) {
    await this.tab(key).click();
    await this.page.waitForURL(new RegExp(`tab=${key}`));
  }

  emptyHeading(key: TabKey) {
    return this.page.getByRole("heading", { name: EMPTY_STATE[key].heading });
  }

  browseFlowersCta() {
    return this.page.getByRole("link", { name: "Browse Flowers" });
  }
}
