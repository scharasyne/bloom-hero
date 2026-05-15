import { test } from "@playwright/test";
import fs from "fs";
import path from "path";
import type { E2ERole } from "./env";

const authPath = (role: E2ERole) =>
  path.join(__dirname, "..", ".auth", `${role}.json`);

/** Skip when global setup did not persist a session (login failed). */
export function skipWithoutAuth(role: E2ERole) {
  test.beforeEach(() => {
    const file = authPath(role);
    if (!fs.existsSync(file)) {
      test.skip(true, `Missing auth file for ${role}. Run global setup.`);
      return;
    }
    const state = JSON.parse(fs.readFileSync(file, "utf8")) as { cookies?: unknown[] };
    if (!state.cookies?.length) {
      test.skip(true, `Login failed for ${role}. Check Supabase test users.`);
    }
  });
}
