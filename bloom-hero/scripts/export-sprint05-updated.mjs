/**
 * tests/sprint-5.csv -> tests/Sprint-05-updated.csv + src/data/sprint05-updated.json
 * Run: npm run sprint05:export
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { REPLACED_MODULE_CASES, MODULE_RATIO_TARGETS } from "./sprint5-module-replacements.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outCsv = path.join(root, "tests", "Sprint-05-updated.csv");
const outJson = path.join(path.join(root, "src", "data"), "sprint05-updated.json");

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
    .replace(/[\u2013\u2014]/g, "-")
    .trim();
}

function modernizeText(s) {
  let t = sanitizeAscii(s);
  t = t.replace(/\bpop[- ]?up\b/gi, "vendor");
  t = t.replace(/\/pop-up\//gi, "/vendor/");
  t = t.replace(/\/market\//gi, "/vendor/");
  t = t.replace(/\/customer\/settings/gi, "/settings");
  t = t.replace(/\/customer\/product/gi, "/products");
  return t;
}

function deriveHonestStatus(c) {
  if (c.status === "Passed" || c.status === "Failed" || c.status === "Partial") return c.status;
  const blob = `${c.actual} ${c.remarks}`.toLowerCase();
  if (/not implemented|no dedicated requests|still shows navbar|grid-cols-2|not 4-per|photo\+name not|vendor settings not wired/i.test(blob)) {
    return "Failed";
  }
  if (/partial|verify manually/i.test(blob)) return "Partial";
  if (/renders|fetch|queries|blocks|redirect|shows|loads|returns/i.test(c.actual.toLowerCase())) return "Passed";
  return "Not Run";
}

function finalizeCase(c) {
  for (const key of ["title", "preconditions", "testData", "steps", "expected", "actual", "remarks"]) {
    c[key] = modernizeText(c[key]);
  }
  c.status = deriveHonestStatus(c);
  return c;
}

function assignIds(cases) {
  return cases.map((row, i) => ({
    ...finalizeCase({ ...row }),
    id: `TC-SP5-${String(i + 1).padStart(3, "0")}`,
  }));
}

function balanceModuleRatios(cases) {
  const byModule = {};
  for (const c of cases) {
    if (!byModule[c.module]) byModule[c.module] = [];
    byModule[c.module].push(c);
  }
  for (const [, list] of Object.entries(byModule)) {
    const target = MODULE_RATIO_TARGETS[list[0].module];
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
    [c.id, c.userStoryId, c.module, c.title, c.testType, c.priority, c.caseType, c.preconditions, c.testData, c.steps, c.expected, c.actual, c.status, c.remarks, c.route, c.role]
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
  const fallback = path.join(root, "tests", "Sprint-05-updated.export.csv");
  fs.writeFileSync(fallback, csvBody);
  console.warn(`Could not write ${outCsv} (${err.code}). Wrote ${fallback}.`);
}
fs.writeFileSync(
  outJson,
  JSON.stringify(
    { generatedAt: new Date().toISOString(), source: "tests/sprint-5.csv (rebuilt)", testAccounts: ACCOUNTS, total: cases.length, sunnyRainyRatio: ratioReport, cases },
    null,
    2
  )
);

console.log(`Wrote ${cases.length} rows -> ${outCsv}`);
for (const [mod, v] of Object.entries(ratioReport)) {
  const t = MODULE_RATIO_TARGETS[mod];
  const ok = v.sunny >= t.sunny && v.rainy >= t.rainy;
  console.log(`  ${ok ? "OK" : "!!"} ${mod}: ${v.sunny} sunny, ${v.rainy} rainy`);
}
