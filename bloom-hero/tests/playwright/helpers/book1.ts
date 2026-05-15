import fs from "fs";
import path from "path";

export type Book1Case = {
  id: string;
  userStoryId: string;
  module: string;
  title: string;
  testType: string;
  priority: string;
  caseType: string;
  preconditions: string;
  testData: string;
  steps: string;
  expected: string;
  actual: string;
  status: string;
  remarks: string;
  automatable: boolean;
  specFile?: string;
  route?: string;
  role?: "guest" | "admin" | "vendor" | "customer" | "unregistered";
};

const MANIFEST_PATH = path.join(__dirname, "..", "cases.manifest.json");

export function loadBook1Manifest(): Book1Case[] {
  if (!fs.existsSync(MANIFEST_PATH)) {
    throw new Error(
      `Missing ${MANIFEST_PATH}. Run: npm run test:book1:export`
    );
  }
  const raw = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8")) as {
    cases: Book1Case[];
  };
  return raw.cases ?? [];
}

export function automatableCases(): Book1Case[] {
  return loadBook1Manifest().filter((c) => c.automatable);
}

export function casesByModule(module: string): Book1Case[] {
  return automatableCases().filter((c) => c.module === module);
}
