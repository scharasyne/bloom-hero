import { chromium, type FullConfig } from "@playwright/test";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { getBaseURL, getRoleCredentials, type E2ERole } from "./helpers/env";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), "tests/playwright/.env.test") });

const authDir = path.join(__dirname, ".auth");
const ROLES: E2ERole[] = ["admin", "vendor", "customer", "unregistered"];

async function saveAuthState(role: E2ERole, baseURL: string) {
  const creds = getRoleCredentials(role);
  const outPath = path.join(authDir, `${role}.json`);
  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();

  await page.goto("/login");
  await page.getByTestId("login-email").fill(creds.email);
  await page.getByTestId("login-password").fill(creds.password);
  await page.getByTestId("login-submit").click();
  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 45_000 });

  await context.storageState({ path: outPath });
  await browser.close();
  console.log(`[e2e] Saved ${role} session (${creds.email})`);
}

export default async function globalSetup(_config: FullConfig) {
  fs.mkdirSync(authDir, { recursive: true });
  const baseURL = getBaseURL();
  for (const role of ROLES) {
    await saveAuthState(role, baseURL);
  }
}
