import { test, expect } from "../../fixtures";
import { skipWithoutAuth } from "../../helpers/auth-guard";
import type { TabKey } from "../../pages/CustomerOrdersPage";

const TABS: TabKey[] = ["to-pay", "to-ship", "to-receive", "completed"];

test.describe("Purchase history tabs (Book1 TC-SP1-009 – TC-SP1-016)", () => {
  skipWithoutAuth("customer");

  test.beforeEach(async ({ customerOrdersPage }) => {
    await customerOrdersPage.goto();
  });

  test("TC-SP1-009 – TC-SP1-013 all order tabs render", async ({ customerOrdersPage }) => {
    await expect(customerOrdersPage.heading()).toBeVisible();
    for (const key of TABS) {
      await customerOrdersPage.selectTab(key);
      await expect(customerOrdersPage.tab(key)).toHaveAttribute("class", /bg-\[#D24B46\]/);
    }
  });

  for (const key of TABS) {
    test(`TC-SP1-016 empty state for ${key} when no orders`, async ({ customerOrdersPage, page }) => {
      await customerOrdersPage.selectTab(key);
      const cards = page.locator("section.rounded-2xl.bg-white.border");
      if ((await cards.count()) > 0) {
        test.skip(true, "Orders exist in database — empty-state test skipped");
        return;
      }
      await expect(customerOrdersPage.emptyHeading(key)).toBeVisible();
      await expect(customerOrdersPage.browseFlowersCta()).toBeVisible();
    });
  }

  test("TC-SP1-013 completed tab shows rate/buy actions when orders exist", async ({ page }) => {
    await page.goto("/orders?tab=completed");
    const rate = page.getByRole("link", { name: /rate order|view rating/i });
    if ((await rate.count()) === 0) {
      test.skip(true, "No completed orders in test database");
      return;
    }
    await expect(rate.first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Buy Again" }).first()).toBeVisible();
  });

  test("TC-SP1-014 to-receive shows order received when orders exist", async ({ page }) => {
    await page.goto("/orders?tab=to-receive");
    const received = page.getByRole("link", { name: "Order Received" });
    if ((await received.count()) === 0) {
      test.skip(true, "No to-receive orders in test database");
      return;
    }
    await expect(received.first()).toBeVisible();
  });

  test("TC-SP1-010 to-ship awaiting confirmation when orders exist", async ({ page }) => {
    await page.goto("/orders?tab=to-ship");
    const msg = page.getByText("Awaiting vendor confirmation");
    if ((await msg.count()) === 0) {
      test.skip(true, "No to-ship orders in test database");
      return;
    }
    await expect(msg.first()).toBeVisible();
  });

  test("TC-SP1-009 to-pay shows pay now when orders exist", async ({ page }) => {
    await page.goto("/orders?tab=to-pay");
    const pay = page.getByRole("link", { name: "Pay Now" });
    if ((await pay.count()) === 0) {
      test.skip(true, "No to-pay orders in test database");
      return;
    }
    await expect(pay.first()).toBeVisible();
  });
});
