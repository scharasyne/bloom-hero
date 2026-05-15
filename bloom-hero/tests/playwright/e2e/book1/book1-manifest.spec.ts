import fs from "fs";
import path from "path";
import { test, expect } from "@playwright/test";
import { loadBook1Manifest, automatableCases } from "../../helpers/book1";

const manifestPath = path.join(__dirname, "../../cases.manifest.json");

test.describe("Book1 manifest quality", () => {
  test("exports cases with test accounts", () => {
    expect(loadBook1Manifest().length).toBeGreaterThanOrEqual(98);
    const raw = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as {
      testAccounts: Record<string, string>;
    };
    expect(raw.testAccounts.admin).toContain("test@admin.com");
    expect(raw.testAccounts.unregistered).toContain("test@unregistered.com");
  });

  test("no legacy pop-up/market vendor roles in automatable cases", () => {
    const bad = automatableCases().filter(
      (c) =>
        /\/pop-up\/|\/market\/|vendor_type\s*=\s*['"]pop-up|vendor_type\s*=\s*['"]market/i.test(
          `${c.steps} ${c.expected} ${c.route}`
        )
    );
    expect(bad.map((c) => c.id)).toEqual([]);
  });

  test("each automatable module has at least 4 sunny cases (or all if fewer than 4)", () => {
    const raw = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as {
      sunnyByModule: Record<string, number>;
      cases: Array<{ module: string; automatable: boolean }>;
    };
    const automatablePerModule = new Map<string, number>();
    for (const c of raw.cases.filter((x) => x.automatable)) {
      automatablePerModule.set(c.module, (automatablePerModule.get(c.module) ?? 0) + 1);
    }
    for (const [module, count] of Object.entries(raw.sunnyByModule)) {
      const cap = automatablePerModule.get(module) ?? 0;
      const required = Math.min(4, cap);
      expect(count, `${module} needs ≥${required} sunny cases`).toBeGreaterThanOrEqual(required);
    }
  });
});
