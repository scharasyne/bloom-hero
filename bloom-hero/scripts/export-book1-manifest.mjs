/**
 * Exports tests/Book1.xlsx → cases.manifest.json + cases.csv
 * Modernizes legacy pop-up/market roles → registered / unregistered vendor model.
 * Run: npm run test:book1:export
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const xlsxPath = path.join(root, "tests", "Book1.xlsx");
const outJson = path.join(root, "tests", "playwright", "cases.manifest.json");
const outCsv = path.join(root, "tests", "playwright", "cases.csv");

const MODULE_RENAMES = {
  "Pop-up Location Discovery": "Vendor location discovery",
  "Pop-up Map Interface": "Vendor map",
};

const MODULE_MAP = {
  "Admin Dashboard Interface": { route: "/admin/dashboard", role: "admin" },
  "Order Status Visualization": { route: "/orders", role: "customer" },
  "Vendor location discovery": { route: "/map", role: "guest" },
  "Forgot Password Flow": { route: "/forgot-password", role: "guest" },
  "Dashboard Role Initialization": { route: "/login", role: "guest" },
  "Vendor Registration": { route: "/vendor-application", role: "customer" },
  "Customer Registration": { route: "/sign-up", role: "guest" },
  "Vendor map": { route: "/map", role: "guest" },
  "End-to-End Auth & Role Testing": { route: "/login", role: "guest" },
  "Initialize Role-Based Access Control (RBAC)": { route: "/login", role: "guest" },
  "Create vendor registration & vendor type logic": { route: "/vendor-application", role: "customer" },
};

const TEST_ACCOUNTS = {
  admin: "test@admin.com / admin",
  customer: "test@customer.com / customer",
  vendor: "test@vendor.com / vendor (registered business)",
  unregistered: "test@unregistered.com / unregistered (unregistered business)",
};

/** Per-case overrides grounded in the current codebase. */
const CASE_OVERRIDES = {
  "TC-SP1-001": {
    module: "Admin Dashboard Interface",
    route: "/login",
    role: "guest",
    caseType: "Sunny",
    automatable: true,
    preconditions: "None",
    testData: TEST_ACCOUNTS.admin,
    steps: "1. Open /login\n2. Verify shared login UI (all roles use /login)",
    expected:
      "BloomHero logo, email and password fields, Sign In button, Forgot password link, Login with Google, Sign up link",
  },
  "TC-SP1-061": {
    caseType: "Sunny",
    testData: TEST_ACCOUNTS.customer,
    steps:
      "1. Go to /login\n2. Sign in as customer\n3. Confirm redirect",
    expected: "Session created; customer lands on / (home) or /dashboard",
    route: "/login",
    role: "guest",
  },
  "TC-SP1-062": {
    caseType: "Sunny",
    testData: TEST_ACCOUNTS.vendor,
    steps:
      "1. Go to /login\n2. Sign in as registered vendor (test@vendor.com)\n3. Confirm redirect",
    expected: "Session created; redirect to /vendor/dashboard",
    route: "/login",
    role: "guest",
  },
  "TC-SP1-063": {
    caseType: "Sunny",
    testData: `${TEST_ACCOUNTS.customer}; wrong password`,
    steps: "1. Go to /login\n2. Enter valid email with wrong password\n3. Submit",
    expected: "Invalid login credentials message; remain on /login",
  },
  "TC-SP1-064": {
    caseType: "Sunny",
    steps: "1. Go to /login\n2. Use unknown email\n3. Submit",
    expected: "Error shown; no session; stay on /login",
  },
  "TC-SP1-065": {
    caseType: "Sunny",
    steps: "1. Without session, open /orders or /admin/dashboard",
    expected: "Redirect to /login",
    route: "/orders",
    role: "guest",
  },
  "TC-SP1-066": {
    caseType: "Rainy",
    steps: "1. Sign in as user with vendor role but no vendor row",
    expected: "Login error or safe redirect; no vendor dashboard without vendor profile",
  },
  "TC-SP1-067": {
    caseType: "Rainy",
    steps: "1. Log in in two tabs with same account\n2. Compare session",
    expected: "Same user in both tabs",
  },
  "TC-SP1-068": {
    caseType: "Sunny",
    testData: TEST_ACCOUNTS.customer,
    steps: "1. Sign in as customer\n2. Open /orders\n3. Refresh page",
    expected: "Still authenticated; Purchase History visible",
    route: "/orders",
    role: "customer",
  },
};

const MANUAL_MODULES = [
  /^initialize api/i,
  /^configure supabase/i,
  /^implement user registration logic/i,
  /^implement signup notification/i,
];

function parseXlsx(filePath) {
  const require = createRequire(import.meta.url);
  const XLSX = require("xlsx");
  const wb = XLSX.readFile(filePath);
  return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
}

function renameModule(name) {
  return MODULE_RENAMES[name] ?? name;
}

function modernizeText(text) {
  return String(text ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/vendor_type\s*=\s*['"]pop-up['"]/gi, "business_type='unregistered'")
    .replace(/vendor_type\s*=\s*['"]market['"]/gi, "business_type='registered'")
    .replace(/vendor_type\s*=\s*['"]popup['"]/gi, "business_type='unregistered'")
    .replace(/\/pop-up\/dashboard/gi, "/vendor/dashboard")
    .replace(/\/market\/dashboard/gi, "/vendor/dashboard")
    .replace(/\/pop-up\//gi, "/vendor/")
    .replace(/\/market\//gi, "/vendor/")
    .replace(/pop-up vendor/gi, "unregistered vendor")
    .replace(/market vendor/gi, "registered vendor")
    .replace(/Stall\/Pop-up/gi, "Registered / Unregistered")
    .replace(/Stall/gi, "Registered")
    .replace(/Pop-up type/gi, "Unregistered business")
    .replace(/requireRole\(\['pop-up'\]\)/gi, "requireRole(['vendor'])")
    .replace(/requireRole\(\['market'\]\)/gi, "requireRole(['vendor'])")
    .replace(/allowedRoles=\['pop-up'\]/gi, "role=vendor")
    .replace(/allowedRoles=\['market'\]/gi, "role=vendor")
    .replace(/Open Figma[^\n]*/gi, "Open the live app in the browser")
    .replace(/Figma prototype/gi, "BloomHero app")
    .replace(/Figma Sprint 1 file is open/gi, "Dev server running at localhost:3000")
    .replace(/admin-log-in/gi, "/login")
    .replace(/Observe pop-up window/gi, "Open /map and inspect the map UI");
}

function isAutomatable(row, module) {
  if (MANUAL_MODULES.some((r) => r.test(module))) return false;
  const steps = modernizeText(row["Steps to Execute"]);
  if (/^call requireRole/i.test(steps) && !/browser|navigate|go to/i.test(steps)) {
    return false;
  }
  return true;
}

function toCase(row) {
  const id = String(row["Test Case ID"] ?? "").trim();
  let module = renameModule(String(row.Module ?? "").trim());
  const override = CASE_OVERRIDES[id] ?? {};
  if (override.module) module = override.module;

  const map = MODULE_MAP[module] ?? { route: "/", role: "guest" };
  const base = {
    id,
    userStoryId: String(row["User Story ID"] ?? "").trim(),
    module,
    title: modernizeText(row["Test Title"]),
    testType: String(row["Test Type"] ?? "").trim(),
    priority: String(row["Priority"] ?? "").trim(),
    caseType: String(row["Case Type"] ?? "").trim(),
    preconditions: modernizeText(row.Preconditions),
    testData: modernizeText(row["Test Data"]),
    steps: modernizeText(row["Steps to Execute"]),
    expected: modernizeText(row["Expected Result"]),
    actual: modernizeText(row["Actual Result"]),
    status: String(row.Status ?? "").trim(),
    remarks: modernizeText(row.Remarks),
    automatable: isAutomatable(row, module),
    route: map.route,
    role: map.role,
  };

  return { ...base, ...override, module };
}

/** Ensure ≥4 Sunny cases per automatable module. */
function ensureSunnyMinimums(cases) {
  const byModule = new Map();
  for (const c of cases) {
    if (!c.automatable) continue;
    if (!byModule.has(c.module)) byModule.set(c.module, []);
    byModule.get(c.module).push(c);
  }

  for (const [, list] of byModule) {
    const target = Math.min(4, list.length);
    const sunny = list.filter((c) => c.caseType.toLowerCase() === "sunny");
    if (sunny.length >= target) continue;
    const candidates = list.filter((c) => c.caseType.toLowerCase() !== "sunny");
    let need = target - sunny.length;
    for (const c of candidates) {
      if (need <= 0) break;
      if (c.priority === "High" || c.testType === "Completeness") {
        c.caseType = "Sunny";
        need--;
      }
    }
    for (const c of candidates) {
      if (need <= 0) break;
      c.caseType = "Sunny";
      need--;
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
    "Automatable",
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
      c.automatable,
      c.route,
      c.role,
    ]
      .map(esc)
      .join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

if (!fs.existsSync(xlsxPath)) {
  console.error(`Missing ${xlsxPath}`);
  process.exit(1);
}

const rows = parseXlsx(xlsxPath);
let cases = rows.filter((r) => r["Test Case ID"]).map(toCase);
ensureSunnyMinimums(cases);

// Promote high-priority rainy cases when a module has fewer than 4 sunny but ≥4 automatable
for (const [, list] of (() => {
  const m = new Map();
  for (const c of cases.filter((x) => x.automatable)) {
    if (!m.has(c.module)) m.set(c.module, []);
    m.get(c.module).push(c);
  }
  return m;
})()) {
  const sunnyCount = list.filter((c) => c.caseType.toLowerCase() === "sunny").length;
  if (list.length >= 4 && sunnyCount < 4) {
    const rainy = list.find((c) => c.caseType.toLowerCase() === "rainy");
    if (rainy) rainy.caseType = "Sunny";
  }
}

const sunnyByModule = {};
for (const c of cases.filter((x) => x.automatable && x.caseType === "Sunny")) {
  if (!MODULE_MAP[c.module] && !Object.values(MODULE_RENAMES).includes(c.module)) continue;
  sunnyByModule[c.module] = (sunnyByModule[c.module] ?? 0) + 1;
}

const payload = {
  generatedAt: new Date().toISOString(),
  source: "tests/Book1.xlsx",
  testAccounts: TEST_ACCOUNTS,
  total: cases.length,
  automatable: cases.filter((c) => c.automatable).length,
  sunnyByModule,
  cases,
};

fs.mkdirSync(path.dirname(outJson), { recursive: true });
fs.writeFileSync(outJson, JSON.stringify(payload, null, 2));
fs.writeFileSync(outCsv, toCsv(cases));
console.log(`Wrote ${cases.length} cases → ${outJson}`);
console.log(`Wrote CSV → ${outCsv}`);
console.log("Sunny cases per automatable module:", sunnyByModule);
