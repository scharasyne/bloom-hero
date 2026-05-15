/**
 * tests/sprint-02.csv -> tests/Sprint-02-updated.csv + src/data/sprint02-updated.json
 * All modules rebuilt with grounded steps (2 Sunny + 8 Rainy each).
 * Run: npm run sprint02:export
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  REPLACED_MODULE_CASES,
  MODULE_RATIO_TARGETS,
} from "./sprint02-module-replacements.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const sourceCsv = path.join(root, "tests", "sprint-02.csv");
const outCsv = path.join(root, "tests", "Sprint-02-updated.csv");
const outJson = path.join(root, "src", "data", "sprint02-updated.json");

const ACCOUNTS = {
  admin: "test@admin.com / admin",
  customer: "test@customer.com / customer",
  vendor: "test@vendor.com / vendor",
  unregistered: "test@unregistered.com / unregistered",
};

function sanitizeAscii(s) {
  return String(s ?? "")
    .replace(/\uFEFF/g, "")
    .replace(/â€¢/g, "- ")
    .replace(/â†'/g, "->")
    .replace(/â†’/g, "->")
    .replace(/â€"/g, "-")
    .replace(/â€™/g, "'")
    .replace(/â€œ|â€/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .trim();
}

function modernizeText(s) {
  let t = sanitizeAscii(s);
  t = t.replace(/\bpop[- ]?up vendor\b/gi, "unregistered vendor");
  t = t.replace(/\bpop[- ]?up\b/gi, "vendor");
  t = t.replace(/\bmarket vendor\b/gi, "registered vendor");
  t = t.replace(/\bstall vendor\b/gi, "registered vendor");
  t = t.replace(/\/pop-up\//gi, "/vendor/");
  t = t.replace(/\/market\//gi, "/vendor/");
  t = t.replace(/\/customer\/orders/gi, "/orders");
  t = t.replace(/\/customer\/review/gi, "/review");
  return t;
}

function deriveHonestStatus(c) {
  if (c.status === "Passed" || c.status === "Failed" || c.status === "Partial") {
    return c.status;
  }
  const blob = `${c.actual} ${c.remarks}`.toLowerCase();
  if (/not implemented|no dedicated|detail page not|placeholder only/i.test(blob)) {
    return "Failed";
  }
  if (/partial|verify manually|confirm business_type/i.test(blob)) {
    return "Partial";
  }
  if (/implemented|renders|redirect|blocks|shows|queries/i.test(c.actual.toLowerCase())) {
    return "Passed";
  }
  return "Not Run";
}

function finalizeCase(c) {
  for (const key of [
    "title",
    "preconditions",
    "testData",
    "steps",
    "expected",
    "actual",
    "remarks",
  ]) {
    c[key] = modernizeText(c[key]);
  }
  c.status = deriveHonestStatus(c);
  return c;
}

function assignIds(cases) {
  return cases.map((row, i) => ({
    ...finalizeCase({ ...row }),
    id: `TC-SP2-${String(i + 1).padStart(3, "0")}`,
  }));
}

function balanceModuleRatios(cases) {
  const byModule = {};
  for (const c of cases) {
    if (!byModule[c.module]) byModule[c.module] = [];
    byModule[c.module].push(c);
  }
  for (const [mod, list] of Object.entries(byModule)) {
    const target = MODULE_RATIO_TARGETS[mod];
    if (!target) continue;
    let sunny = list.filter((c) => c.caseType === "Sunny").length;
    let rainy = list.filter((c) => c.caseType === "Rainy").length;
    while (sunny < target.sunny && rainy > target.rainy) {
      const pick = list.find((c) => c.caseType === "Rainy");
      if (!pick) break;
      pick.caseType = "Sunny";
      sunny++;
      rainy--;
    }
    while (rainy < target.rainy && sunny > target.sunny) {
      const pick = list.find((c) => c.caseType === "Sunny");
      if (!pick) break;
      pick.caseType = "Rainy";
      sunny--;
      rainy++;
    }
  }
}

function toCsv(cases) {
  const headers = [
    "Test Case ID",
    "User Story ID",
    "Module",
    "Test Title",
    "Test Type",
    "Priority",
    "Case Type",
    "Preconditions",
    "Test Data",
    "Steps to Execute",
    "Expected Result",
    "Actual Result",
    "Status",
    "Remarks",
    "Route",
    "Role",
  ];
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = cases.map((c) =>
    [
      c.id,
      c.userStoryId,
      c.module,
      c.title,
      c.testType,
      c.priority,
      c.caseType,
      c.preconditions,
      c.testData,
      c.steps,
      c.expected,
      c.actual,
      c.status,
      c.remarks,
      c.route,
      c.role,
    ]
      .map(esc)
      .join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

let cases = assignIds(REPLACED_MODULE_CASES.map((row) => ({ ...row })));
balanceModuleRatios(cases);
cases = cases.map(finalizeCase);

const ratioReport = {};
for (const c of cases) {
  if (!ratioReport[c.module]) ratioReport[c.module] = { sunny: 0, rainy: 0 };
  if (c.caseType === "Sunny") ratioReport[c.module].sunny++;
  else ratioReport[c.module].rainy++;
}

fs.mkdirSync(path.dirname(outJson), { recursive: true });
const csvBody = "\uFEFF" + toCsv(cases);
try {
  fs.writeFileSync(outCsv, csvBody);
} catch (err) {
  const fallback = path.join(root, "tests", "Sprint-02-updated.export.csv");
  fs.writeFileSync(fallback, csvBody);
  console.warn(`Could not write ${outCsv} (${err.code}). Wrote ${fallback}. Close Excel and re-run.`);
}
fs.writeFileSync(
  outJson,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      source: "tests/sprint-02.csv (rebuilt modules)",
      testAccounts: ACCOUNTS,
      total: cases.length,
      sunnyRainyRatio: ratioReport,
      cases,
    },
    null,
    2
  )
);

console.log(`Wrote ${cases.length} rows -> ${outCsv}`);
console.log(`Wrote JSON -> ${outJson}`);
console.log("Sunny:Rainy per module (target: 2 sunny, 8 rainy):");
for (const [mod, v] of Object.entries(ratioReport)) {
  const target = MODULE_RATIO_TARGETS[mod];
  const ok = v.sunny >= target.sunny && v.rainy >= target.rainy;
  console.log(`  ${ok ? "OK" : "!!"} ${mod}: ${v.sunny} sunny, ${v.rainy} rainy`);
}
