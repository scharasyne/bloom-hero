import { test, expect } from "@playwright/test";

test.describe("Search API (Book1 Initialize API & data flow)", () => {
  test("TC-SP1-045 flowers search returns JSON", async ({ request }) => {
    const res = await request.get("/api/search?q=rose&scope=flowers");
    expect(res.status()).toBeLessThan(300);
    const body = await res.json();
    expect(body).toHaveProperty("flowers");
    expect(Array.isArray(body.flowers)).toBe(true);
  });

  test("TC-SP1-046 vendors search returns JSON", async ({ request }) => {
    const res = await request.get("/api/search?q=shop&scope=vendors");
    expect(res.status()).toBeLessThan(300);
    const body = await res.json();
    expect(body).toHaveProperty("vendors");
    expect(Array.isArray(body.vendors)).toBe(true);
  });

  test("TC-SP1-048 empty query returns empty arrays", async ({ request }) => {
    const res = await request.get("/api/search?q=&scope=all");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.flowers).toEqual([]);
    expect(body.vendors).toEqual([]);
  });
});
