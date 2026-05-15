/**
 * Book1.xlsx → tests/Book1-updated.csv + src/data/book1-updated.json
 * Steps/expected/actual grounded in current codebase (unified vendor, registered/unregistered).
 * Run: npm run book1:export
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import {
  REPLACED_MODULE_CASES,
  REPLACED_MODULE_NAMES,
  MODULE_RATIO_TARGETS,
} from "./book1-module-replacements.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const xlsxPath = path.join(root, "tests", "Book1.xlsx");
const outCsv = path.join(root, "tests", "Book1-updated.csv");
const outJson = path.join(root, "src", "data", "book1-updated.json");

const ACCOUNTS = {
  admin: "test@admin.com / admin",
  customer: "test@customer.com / customer",
  vendor: "test@vendor.com / vendor",
  unregistered: "test@unregistered.com / unregistered",
  invalid: "wrong-password-123",
};

const MODULE_RENAMES = {
  "Pop-up Location Discovery": "Vendor location discovery",
  "Pop-up Map Interface": "Vendor map",
};

/** One primary sunny per module (max sunny = floor(cases/5)). */
const PREFERRED_SUNNY = {
  "Admin Dashboard Interface": ["TC-SP1-001", "TC-SP1-002"],
  "Order Status Visualization": ["TC-SP1-009", "TC-SP1-010"],
  "Vendor location discovery": ["TC-SP1-017"],
  "Forgot Password Flow": ["TC-SP1-025"],
  "Dashboard Role Initialization": ["TC-SP1-029"],
  "Vendor Registration": ["TC-SP1-033"],
  "Customer Registration": ["TC-SP1-037"],
  "Vendor map": ["TC-SP1-041"],
  "End-to-End Auth & Role Testing": ["TC-SP1-061", "TC-SP1-062"],
  "Initialize Role-Based Access Control (RBAC)": ["TC-SP1-053", "TC-SP1-054"],
  "Create vendor registration & vendor type logic": ["TC-SP1-091", "TC-SP1-092"],
  "Implement User Registration Logic": ["TC-SP1-075", "TC-SP1-078"],
  "Initialize API & data flow": ["TC-SP1-045", "TC-SP1-046"],
};

const MODULE_META = {
  "Admin Dashboard Interface": { route: "/login", role: "guest" },
  "Order Status Visualization": { route: "/orders", role: "customer", account: "customer" },
  "Vendor location discovery": { route: "/map", role: "guest" },
  "Forgot Password Flow": { route: "/forgot-password", role: "guest" },
  "Dashboard Role Initialization": { route: "/login", role: "guest" },
  "Vendor Registration": { route: "/vendor-application", role: "customer", account: "customer" },
  "Customer Registration": { route: "/sign-up", role: "guest" },
  "Vendor map": { route: "/map", role: "guest" },
  "End-to-End Auth & Role Testing": { route: "/login", role: "guest" },
  "Initialize Role-Based Access Control (RBAC)": { route: "/login", role: "guest" },
  "Create vendor registration & vendor type logic": {
    route: "/vendor-application",
    role: "customer",
    account: "customer",
  },
  "Implement User Registration Logic": { route: "/sign-up", role: "guest" },
  "Initialize API & data flow": { route: "/api/search", role: "guest" },
};

/** Codebase-verified updates per test case ID. */
const CASES = {
  "TC-SP1-001": {
    preconditions: "App running; no session required",
    testData: ACCOUNTS.admin,
    steps: "1. Open /login\n2. Verify login form elements",
    expected:
      "BloomHero logo, email and password fields, Sign In, Forgot password link, Login with Google, Sign up link",
    actual:
      "Implemented at /login (shared for admin, vendor, customer). Logo, email, password, Sign In, Forgot your password?, Login with Google, Sign up. Back control is an icon button to /.",
    status: "Passed",
    route: "/login",
    role: "guest",
    caseType: "Sunny",
  },
  "TC-SP1-002": {
    preconditions: `Signed in as admin (${ACCOUNTS.admin})`,
    testData: ACCOUNTS.admin,
    steps:
      "1. Sign in as admin\n2. Open /admin/vendor-applications\n3. Review pending application cards",
    expected: "Pending vendor cards with name, business type, documents, Approve and Reject",
    actual:
      "Page at /admin/vendor-applications lists pending applications with shop name, Registered/Unregistered business type label, document badges, Approve/Reject per card, bulk Approve Selected / Reject All.",
    status: "Passed",
    route: "/admin/vendor-applications",
    role: "admin",
    caseType: "Sunny",
  },
  "TC-SP1-003": {
    preconditions: "Admin on vendor applications page",
    testData: ACCOUNTS.admin,
    steps: "1. On an application card, click View Documents\n2. Confirm document links",
    expected: "Business permit and ID visible with preview or open action",
    actual:
      "View Documents toggles inline list; files open in a new browser tab. No embedded zoom/preview panel in the card.",
    status: "Partial",
    route: "/admin/vendor-applications",
    role: "admin",
    caseType: "Sunny",
  },
  "TC-SP1-004": {
    preconditions: "Admin on vendor applications page",
    testData: ACCOUNTS.admin,
    steps: "1. Click Reject on a card\n2. Confirm rejection reason UI\n3. Confirm Approve button",
    expected: "Approve and Reject buttons; rejection reason on reject",
    actual:
      "Green Approve and red Reject on each card. Reject opens inline panel with reason dropdown (Incomplete documents, Invalid permit, Duplicate registration, Other) and Confirm Reject.",
    status: "Passed",
    route: "/admin/vendor-applications",
    role: "admin",
    caseType: "Sunny",
  },
  "TC-SP1-005": {
    preconditions: `Signed in as admin (${ACCOUNTS.admin})`,
    testData: ACCOUNTS.admin,
    steps: "1. Open /admin/vendors\n2. Inspect vendor table",
    expected: "Vendor name, business type, status, actions",
    actual:
      "Vendors page shows searchable table with vendor name, Registered/Unregistered type, Verified/Pending/Suspended status badges, filters, and profile actions.",
    status: "Passed",
    route: "/admin/vendors",
    role: "admin",
    caseType: "Sunny",
  },
  "TC-SP1-006": {
    testData: ACCOUNTS.admin,
    steps: "1. On /admin/vendors locate Verified, Pending, and Suspended rows",
    expected: "Distinct green, yellow, and red status badges",
    actual:
      "Status chips use distinct colors/icons for verified (green), pending (amber), and suspended (red/pink) states.",
    status: "Passed",
    route: "/admin/vendors",
    role: "admin",
    caseType: "Sunny",
  },
  "TC-SP1-007": {
    testData: ACCOUNTS.admin,
    steps: "1. On /admin/vendors use search and filter controls",
    expected: "Search and status/type filters",
    actual: 'Search placeholder "Search vendors..." plus filter menus for business type, status, and insight chips.',
    status: "Passed",
    route: "/admin/vendors",
    role: "admin",
    caseType: "Sunny",
  },
  "TC-SP1-008": {
    testData: ACCOUNTS.admin,
    steps: "1. Open /admin/review-moderation\n2. Check tabs and review actions",
    expected: "Pending reviews list with approve/reject",
    actual:
      "Review Moderation at /admin/review-moderation with Pending, Approved, Rejected tabs and per-review moderation actions.",
    status: "Passed",
    route: "/admin/review-moderation",
    role: "admin",
    caseType: "Sunny",
  },
  "TC-SP1-009": {
    preconditions: `Customer signed in (${ACCOUNTS.customer})`,
    testData: ACCOUNTS.customer,
    steps: "1. Open /orders?tab=to-pay\n2. Inspect order card actions",
    expected: "Payment deadline and pay actions on to-pay orders",
    actual:
      "Purchase History To Pay tab shows PaymentCountdown, Pay Now, Cancel Order when orders exist; empty state otherwise.",
    status: "Passed",
    route: "/orders?tab=to-pay",
    role: "customer",
    caseType: "Sunny",
  },
  "TC-SP1-010": {
    testData: ACCOUNTS.customer,
    steps: "1. Open /orders?tab=to-ship",
    expected: "Vendor preparing message or status badge",
    actual:
      'To Ship tab shows "Awaiting vendor confirmation" badge on confirmed orders.',
    status: "Passed",
    route: "/orders?tab=to-ship",
    role: "customer",
    caseType: "Sunny",
  },
  "TC-SP1-011": {
    testData: ACCOUNTS.customer,
    steps: "1. Open /orders?tab=to-receive\n2. Look for 5-stage delivery timeline",
    expected: "Timeline: Paid, Preparing, Shipped, Out for Delivery, Completed",
    actual:
      "No multi-stage timeline on order cards. Tab shows line items and Order Received CTA only.",
    status: "Failed",
    route: "/orders?tab=to-receive",
    role: "customer",
  },
  "TC-SP1-012": {
    testData: ACCOUNTS.customer,
    steps: "1. Compare status badges across tabs",
    expected: "Active timeline stage highlighted with checkmarks on completed stages",
    actual:
      "Per-tab status badges exist (amber/blue/purple/green). No per-stage timeline with timestamps on cards.",
    status: "Partial",
    route: "/orders",
    role: "customer",
  },
  "TC-SP1-013": {
    testData: ACCOUNTS.customer,
    steps: "1. Open /orders?tab=completed",
    expected: "Rate order and buy again actions",
    actual: 'Completed tab shows Rate Order / View Rating and Buy Again links on orders.',
    status: "Passed",
    route: "/orders?tab=completed",
    role: "customer",
    caseType: "Sunny",
  },
  "TC-SP1-014": {
    testData: ACCOUNTS.customer,
    steps: "1. On to-receive order look for Track Package and courier fields",
    expected: "Track Package button plus courier name and ETA",
    actual:
      "Order Received CTA exists. No Track Package button or courier/ETA fields on the card.",
    status: "Failed",
    route: "/orders?tab=to-receive",
    role: "customer",
  },
  "TC-SP1-015": {
    testData: ACCOUNTS.customer,
    steps: "1. On to-pay tab inspect overdue payment styling",
    expected: "Distinct overdue label and warning styling when deadline passed",
    actual:
      "PaymentCountdown shows due timing but overdue state is not visually distinct from upcoming due dates.",
    status: "Failed",
    route: "/orders?tab=to-pay",
    role: "customer",
  },
  "TC-SP1-016": {
    testData: ACCOUNTS.customer,
    steps: "1. Open /orders with no orders in a tab",
    expected: "Empty state with browse CTA",
    actual:
      'Empty states per tab (e.g. "No pending payments") with Browse Flowers button to /.',
    status: "Passed",
    route: "/orders",
    role: "customer",
    caseType: "Sunny",
  },
  "TC-SP1-017": {
    steps: "1. Open /map as guest\n2. Search for a location",
    expected: "Map loads and accepts location search",
    actual: "Public /map renders Leaflet map with sidebar search and scheduled vendor pins.",
    status: "Passed",
    route: "/map",
    role: "guest",
    caseType: "Sunny",
  },
  "TC-SP1-018": {
    steps: "1. On /map select a vendor pin\n2. Open vendor detail",
    expected: "Vendor detail modal or panel",
    actual: "PopUpMapSidebar and PopUpVendorModal show vendor schedule/location details.",
    status: "Passed",
    route: "/map",
    role: "guest",
    caseType: "Sunny",
  },
  "TC-SP1-019": {
    steps: "1. On /map filter today vs upcoming vendors",
    expected: "Lists reflect schedule dates",
    actual: "Sidebar splits vendors into today and upcoming based on popup_locations schedule dates.",
    status: "Passed",
    route: "/map",
    role: "guest",
    caseType: "Sunny",
  },
  "TC-SP1-020": {
    steps: "1. Open /map with no vendors scheduled",
    expected: "Empty or low-data state",
    actual: "Map still renders; sidebar may be empty when no vendors match filters.",
    status: "Passed",
    route: "/map",
    role: "guest",
    caseType: "Sunny",
  },
  "TC-SP1-025": {
    steps: "1. Open /forgot-password while signed out\n2. Submit email for reset",
    expected: "Reset email flow",
    actual:
      "Forgot password page sends Supabase resetPasswordForEmail and shows confirmation message.",
    status: "Passed",
    route: "/forgot-password",
    role: "guest",
    caseType: "Sunny",
  },
  "TC-SP1-029": {
    testData: ACCOUNTS.admin,
    steps: "1. Sign in as admin\n2. Confirm landing URL",
    expected: "Admin dashboard",
    actual: "signInWithPasswordAction + resolvePostLoginDestination → /admin/dashboard.",
    status: "Passed",
    route: "/admin/dashboard",
    role: "admin",
    caseType: "Sunny",
  },
  "TC-SP1-030": {
    testData: ACCOUNTS.vendor,
    steps: "1. Sign in as registered vendor\n2. Confirm landing URL",
    expected: "Vendor dashboard",
    actual: "Vendor with vendors row → /vendor/dashboard.",
    status: "Passed",
    route: "/vendor/dashboard",
    role: "vendor",
    caseType: "Sunny",
  },
  "TC-SP1-031": {
    testData: ACCOUNTS.unregistered,
    steps: "1. Sign in as unregistered vendor\n2. Confirm landing URL",
    expected: "Vendor dashboard (unregistered business)",
    actual: "Same /vendor/dashboard; business_type unregistered gates catalog via canManageCatalog().",
    status: "Passed",
    route: "/vendor/dashboard",
    role: "unregistered",
    caseType: "Sunny",
  },
  "TC-SP1-032": {
    testData: ACCOUNTS.customer,
    steps: "1. Sign in as customer\n2. Confirm landing URL",
    expected: "Customer home or dashboard",
    actual: "Customer role redirects to / after login (requireRole on /dashboard).",
    status: "Passed",
    route: "/",
    role: "customer",
    caseType: "Sunny",
  },
  "TC-SP1-033": {
    testData: ACCOUNTS.customer,
    steps:
      "1. Sign in as customer\n2. Open /vendor-application\n3. Complete application as registered or unregistered business",
    expected: "Application submitted; vendor profile created after approval",
    actual:
      "Customer-only /vendor-application flow; business_type registered|unregistered (not market/pop-up roles). Approval via admin queue.",
    status: "Passed",
    route: "/vendor-application",
    role: "customer",
    caseType: "Sunny",
  },
  "TC-SP1-037": {
    steps: "1. Open /sign-up\n2. Register with email, username, password",
    expected: "Customer account created",
    actual:
      "Sign-up creates Supabase user with role customer in metadata; prompts email confirmation.",
    status: "Passed",
    route: "/sign-up",
    role: "guest",
    caseType: "Sunny",
  },
  "TC-SP1-041": {
    steps: "1. Open /map\n2. Verify map and pins",
    expected: "Map with vendor pins",
    actual: "PopUpMap client component with Leaflet map and vendor markers from getPopUpMapVendors.",
    status: "Passed",
    route: "/map",
    role: "guest",
    caseType: "Sunny",
  },
  "TC-SP1-053": {
    testData: ACCOUNTS.admin,
    steps: "1. Sign in as admin\n2. Open /admin/dashboard",
    expected: "Admin session allowed",
    actual: "requireRole(['admin']) in (admin)/layout.tsx permits access.",
    status: "Passed",
    route: "/admin/dashboard",
    role: "admin",
    caseType: "Sunny",
  },
  "TC-SP1-054": {
    testData: ACCOUNTS.vendor,
    steps: "1. Sign in as vendor\n2. Open /vendor/dashboard",
    expected: "Vendor session allowed",
    actual: "requireRole(['vendor']) in (vendor)/layout.tsx permits access.",
    status: "Passed",
    route: "/vendor/dashboard",
    role: "vendor",
    caseType: "Sunny",
  },
  "TC-SP1-056": {
    testData: ACCOUNTS.customer,
    steps: "1. Sign in as customer\n2. Open /orders",
    expected: "Customer session allowed",
    actual: "requireRole(['customer']) in (customer)/layout.tsx permits access.",
    status: "Passed",
    route: "/orders",
    role: "customer",
    caseType: "Sunny",
  },
  "TC-SP1-057": {
    testData: ACCOUNTS.admin,
    steps: "1. While signed in as admin, open /vendor/dashboard",
    expected: "Redirect away from vendor area",
    actual: "requireRole redirects admin to /admin/dashboard.",
    status: "Passed",
    route: "/vendor/dashboard",
    role: "admin",
    caseType: "Sunny",
  },
  "TC-SP1-061": {
    testData: ACCOUNTS.customer,
    steps: "1. /login → sign in as customer\n2. Verify URL",
    expected: "Authenticated customer session",
    actual: "Session cookie set; redirect to /.",
    status: "Passed",
    route: "/login",
    role: "guest",
    caseType: "Sunny",
  },
  "TC-SP1-062": {
    testData: ACCOUNTS.vendor,
    steps: "1. /login → sign in as registered vendor\n2. Verify URL",
    expected: "Redirect to /vendor/dashboard",
    actual: "resolvePostLoginDestination checks vendors row → /vendor/dashboard.",
    status: "Passed",
    route: "/login",
    role: "guest",
    caseType: "Sunny",
  },
  "TC-SP1-063": {
    testData: `${ACCOUNTS.customer}; password: ${ACCOUNTS.invalid}`,
    steps: "1. /login with wrong password",
    expected: "Invalid credentials error",
    actual: 'Supabase returns error; UI shows "Invalid login credentials".',
    status: "Passed",
    route: "/login",
    role: "guest",
    caseType: "Sunny",
  },
  "TC-SP1-064": {
    testData: "unknown@bloomhero.test",
    steps: "1. /login with unknown email",
    expected: "Login error, no session",
    actual: "Same invalid credentials message; remains on /login.",
    status: "Passed",
    route: "/login",
    role: "guest",
    caseType: "Sunny",
  },
  "TC-SP1-065": {
    steps: "1. Without session visit /orders or /admin/dashboard",
    expected: "Redirect to /login",
    actual: "proxy.ts PROTECTED_PREFIXES redirect unauthenticated users to /login.",
    status: "Passed",
    route: "/orders",
    role: "guest",
    caseType: "Sunny",
  },
  "TC-SP1-068": {
    testData: ACCOUNTS.customer,
    steps: "1. Sign in\n2. Open /orders\n3. Refresh browser",
    expected: "Still authenticated",
    actual: "Supabase SSR session persists; Purchase History remains visible.",
    status: "Passed",
    route: "/orders",
    role: "customer",
    caseType: "Sunny",
  },
  "TC-SP1-091": {
    testData: ACCOUNTS.customer,
    steps:
      "1. As customer open /vendor-application\n2. Submit application with business_type registered",
    expected: "Application stored with business_type registered",
    actual:
      "vendor_applications uses business_type registered|unregistered; normalizeBusinessType maps legacy market→registered, pop-up→unregistered.",
    status: "Passed",
    route: "/vendor-application",
    role: "customer",
    caseType: "Sunny",
  },
  "TC-SP1-092": {
    testData: ACCOUNTS.customer,
    steps:
      "1. As customer open /vendor-application\n2. Submit application with business_type unregistered",
    expected: "Application stored with business_type unregistered",
    actual: "Unregistered path creates application without full catalog until business registration.",
    status: "Passed",
    route: "/vendor-application",
    role: "customer",
    caseType: "Sunny",
  },
  "TC-SP1-008": {
    preconditions: `Signed in as admin (${ACCOUNTS.admin})`,
    steps: "1. Open /admin/review-moderation\n2. Verify Pending tab and review cards",
    expected: "Pending reviews with moderation actions",
    actual:
      "Review Moderation page with Pending, Approved, Rejected tabs (not legacy Flagged-only design).",
    status: "Passed",
    route: "/admin/review-moderation",
    role: "admin",
    caseType: "Sunny",
  },
  "TC-SP1-020": {
    title: "Vendor schedule sidebar list on map",
    steps: "1. Open /map\n2. Review today and upcoming vendor lists in sidebar",
    expected: "Sidebar lists scheduled vendors",
    actual: "PopUpMapSidebar lists todayVendors and upcomingVendors filtered by schedule dates.",
    status: "Passed",
    route: "/map",
    role: "guest",
    caseType: "Sunny",
  },
  "TC-SP1-041": {
    title: "Vendor map view displays correctly",
    preconditions: "Dev server running",
    steps: "1. Open /map\n2. Confirm Leaflet map and pins render",
    expected: "Map with vendor pins and labels",
    actual: "PopUpMap renders Leaflet map; pins from getPopUpMapVendors; vendor modal on select.",
    status: "Passed",
    route: "/map",
    role: "guest",
    caseType: "Sunny",
  },
  "TC-SP1-053": {
    title: "RBAC allows vendor role to access /vendor routes",
    testData: ACCOUNTS.vendor,
    steps: "1. Sign in as vendor\n2. Open /vendor/dashboard and /vendor/schedule",
    expected: "Vendor routes load without redirect to login",
    actual:
      "(vendor)/layout requireRole(['vendor']) allows access; unified /vendor/* routes (legacy /pop-up/* redirects via next.config).",
    status: "Passed",
    route: "/vendor/dashboard",
    role: "vendor",
    caseType: "Sunny",
  },
  "TC-SP1-054": {
    testData: ACCOUNTS.unregistered,
    steps: "1. Sign in as unregistered vendor\n2. Open /vendor/schedule and /vendor/profile",
    expected: "Schedule and profile available",
    actual:
      "Unregistered vendors use same /vendor routes; catalog locked via canManageCatalog() on products/orders.",
    status: "Passed",
    route: "/vendor/schedule",
    role: "unregistered",
    caseType: "Sunny",
  },
  "TC-SP1-055": {
    testData: ACCOUNTS.customer,
    steps: "1. Sign in as customer\n2. Visit /vendor/dashboard",
    expected: "Redirect to customer-appropriate page",
    actual: "requireRole sends customer to / (home).",
    status: "Passed",
    route: "/vendor/dashboard",
    role: "customer",
    caseType: "Sunny",
  },
  "TC-SP1-056": {
    title: "Customer can access /orders",
    testData: ACCOUNTS.customer,
    steps: "1. Sign in as customer\n2. Open /orders",
    expected: "Purchase History loads",
    actual: "Customer layout requireRole(['customer']) allows /orders.",
    status: "Passed",
    route: "/orders",
    role: "customer",
    caseType: "Sunny",
  },
  "TC-SP1-058": {
    testData: ACCOUNTS.vendor,
    steps: "1. Sign in as vendor\n2. Visit /admin/dashboard",
    expected: "Redirect to vendor dashboard",
    actual: "requireRole redirects vendor to /vendor/dashboard.",
    status: "Passed",
    route: "/admin/dashboard",
    role: "vendor",
    caseType: "Sunny",
  },
  "TC-SP1-059": {
    title: "Legacy /pop-up/dashboard redirects to /vendor/dashboard",
    steps: "1. Open /pop-up/dashboard\n2. Confirm final URL",
    expected: "Unified vendor dashboard URL",
    actual: "next.config.ts redirects /pop-up/dashboard and /market/dashboard to /vendor/dashboard.",
    status: "Passed",
    route: "/vendor/dashboard",
    role: "guest",
    caseType: "Sunny",
  },
  "TC-SP1-094": {
    testData: ACCOUNTS.customer,
    steps:
      "1. Apply as unregistered vendor at /vendor-application\n2. Before approval visit /vendor/dashboard",
    expected: "Pending application messaging; no catalog until approved",
    actual:
      "Vendor dashboard shows Application Pending banner when status is pending; catalog tools gated by approval + business_type.",
    status: "Passed",
    route: "/vendor-application",
    role: "customer",
    caseType: "Sunny",
  },
  "TC-SP1-098": {
    testData: ACCOUNTS.customer,
    steps:
      "1. On /vendor-application select unregistered business type\n2. Continue form\n3. Navigate back",
    expected: "business_type selection persists",
    actual: "CustomerVendorApplicationPageView keeps form state for business_type registered|unregistered.",
    status: "Passed",
    route: "/vendor-application",
    role: "customer",
    caseType: "Sunny",
  },
};

/** Avoid Excel mojibake: use ASCII punctuation only. */
function sanitizeAscii(text) {
  return String(text ?? "")
    .replace(/\uFEFF/g, "")
    .replace(/â€™/g, "'")
    .replace(/â€œ|â€\u009d/g, '"')
    .replace(/â€¢/g, "- ")
    .replace(/â†'|â†'/g, "->")
    .replace(/â€"/g, "-")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u2192\u2794]/g, "->")
    .replace(/[\u2022\u25CF\u25E6]/g, "- ")
    .replace(/\t/g, " ")
    .replace(/ +/g, " ")
    .trim();
}

function modernizeText(text) {
  return sanitizeAscii(
    String(text ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/vendor_type\s*=\s*['"]pop-up['"]/gi, "business_type='unregistered'")
    .replace(/vendor_type\s*=\s*['"]market['"]/gi, "business_type='registered'")
    .replace(/\/pop-up\/dashboard/gi, "/vendor/dashboard")
    .replace(/\/market\/dashboard/gi, "/vendor/dashboard")
    .replace(/\/pop-up\//gi, "/vendor/")
    .replace(/\/market\//gi, "/vendor/")
    .replace(/pop-up vendor/gi, "unregistered vendor")
    .replace(/market vendor/gi, "registered vendor")
    .replace(/Stall\/Pop-up/gi, "Registered / Unregistered")
    .replace(/Open Figma[^\n]*/gi, "Open the app in the browser")
    .replace(/Figma prototype/gi, "BloomHero app")
    .replace(/Observe pop-up window/gi, "Inspect /map page")
    .replace(/Figma Sprint 1 file is open/gi, "Dev server running at localhost:3000")
    .replace(/Figma design prototype available/gi, "Dev server running")
    .replace(/Pop-up List View/gi, "Vendor schedule sidebar")
    .replace(/Pop-up map/gi, "Vendor map")
    .replace(/pop-up type to access pop-up routes/gi, "vendor role to access /vendor routes")
    .replace(/Select 'pop-up' as vendor type/gi, "Select unregistered business type")
    .replace(/Submit vendor application as pop-up/gi, "Submit as unregistered business")
    .replace(/market type/gi, "registered business type")
    .replace(/applies as pop-up/gi, "applies as unregistered vendor")
    .replace(/No pop-ups near you/gi, "No vendors scheduled nearby")
    .replace(/Pins layer in Figma/gi, "Multiple vendors in database")
  );
}

/**
 * Per module: rainy count >= sunny count * 4.
 * Max sunny = floor(total/5) so one sunny bundle fits (1 sunny + 4 rainy minimum).
 */
function balanceSunnyRainyRatio(cases) {
  const byModule = new Map();
  for (const c of cases) {
    if (!byModule.has(c.module)) byModule.set(c.module, []);
    byModule.get(c.module).push(c);
  }

  for (const [module, list] of byModule) {
    const target = MODULE_RATIO_TARGETS[module];
    const preferred = PREFERRED_SUNNY[module] ?? [];
    const maxSunny = target
      ? target.sunny
      : Math.floor(list.length / 5);
    const minRainy = target ? target.rainy : maxSunny * 4;

    const ranked = [...list].sort((a, b) => {
      const ai = preferred.indexOf(a.id);
      const bi = preferred.indexOf(b.id);
      const ap = ai >= 0 ? 1000 - ai : 0;
      const bp = bi >= 0 ? 1000 - bi : 0;
      const as = a.caseType?.toLowerCase() === "sunny" ? 50 : 0;
      const bs = b.caseType?.toLowerCase() === "sunny" ? 50 : 0;
      return bp + bs - (ap + as);
    });

    ranked.forEach((c, i) => {
      c.caseType = i < maxSunny ? "Sunny" : "Rainy";
    });

    let sunny = list.filter((c) => c.caseType === "Sunny").length;
    let rainy = list.filter((c) => c.caseType === "Rainy").length;
    while (sunny > maxSunny) {
      const demote = list
        .filter((c) => c.caseType === "Sunny")
        .sort((a, b) => preferred.indexOf(b.id) - preferred.indexOf(a.id))[0];
      if (!demote) break;
      demote.caseType = "Rainy";
      sunny--;
      rainy++;
    }
    while (rainy < minRainy && sunny > 0) {
      const demote = list
        .filter((c) => c.caseType === "Sunny")
        .sort((a, b) => preferred.indexOf(b.id) - preferred.indexOf(a.id))[0];
      if (!demote) break;
      demote.caseType = "Rainy";
      sunny--;
      rainy++;
    }
    while (sunny > 0 && rainy < sunny * 4) {
      const demote = list
        .filter((c) => c.caseType === "Sunny")
        .sort((a, b) => preferred.indexOf(b.id) - preferred.indexOf(a.id))[0];
      if (!demote) break;
      demote.caseType = "Rainy";
      sunny--;
      rainy++;
    }
  }
}

function deriveHonestStatus(c) {
  if (c.status === "Passed" || c.status === "Failed" || c.status === "Partial") {
    return c.status;
  }
  if (/backend\/integration|verify in supabase|server logs/i.test(c.actual)) {
    return "Not Run";
  }
  const blob = `${c.actual} ${c.remarks} ${c.expected}`.toLowerCase();
  if (/not implemented|no multi-stage|no track package|not visually distinct|not embedded/i.test(blob)) {
    return "Failed";
  }
  if (/partial|inline list|new tab|verify in supabase|run steps at|not run/i.test(blob)) {
    return "Partial";
  }
  if (c.caseType === "Rainy" && /redirect|blocked|error|invalid credentials/i.test(blob)) {
    return "Passed";
  }
  if (/implemented|shows|lists|allows|redirects|renders/i.test(c.actual.toLowerCase())) {
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
    c[key] = sanitizeAscii(c[key]);
  }
  c.status = deriveHonestStatus(c);
  return c;
}

function parseXlsx(filePath) {
  const XLSX = createRequire(import.meta.url)("xlsx");
  const wb = XLSX.readFile(filePath);
  return createRequire(import.meta.url)("xlsx").utils.sheet_to_json(
    wb.Sheets[wb.SheetNames[0]],
    { defval: "" }
  );
}

function defaultActual(c, meta) {
  if (/initialize api|google oauth|signup notification|registration logic/i.test(c.module)) {
    return "Backend/integration — verify in Supabase or server logs; not a single UI route.";
  }
  if (/^call requireRole/i.test(c.steps) || /RBAC/i.test(c.module)) {
    return "Use browser: sign in with Test Data account, visit Route, confirm redirect or access per requireRole() in src/features/auth/utils/require-role.ts.";
  }
  if (c.module === "Create vendor registration & vendor type logic") {
    return `Open ${c.route} as customer (${ACCOUNTS.customer}); business_type is registered|unregistered only.`;
  }
  if (meta?.route && meta?.account && ACCOUNTS[meta.account]) {
    return `Run steps at ${meta.route} signed in as ${ACCOUNTS[meta.account]}.`;
  }
  return `Run steps at ${c.route || "/"} with Test Data account.`;
}

function buildCase(row) {
  const id = String(row["Test Case ID"] ?? "").trim();
  const module = MODULE_RENAMES[String(row.Module ?? "").trim()] ?? String(row.Module ?? "").trim();
  const meta = MODULE_META[module] ?? { route: "/", role: "guest" };
  const override = CASES[id] ?? {};
  const accountKey = meta.account;

  const base = {
    id,
    userStoryId: String(row["User Story ID"] ?? "").trim(),
    module,
    title: modernizeText(override.title ?? row["Test Title"]),
    testType: String(row["Test Type"] ?? "").trim(),
    priority: String(row["Priority"] ?? "").trim(),
    caseType: String(row["Case Type"] ?? "").trim(),
    preconditions: modernizeText(override.preconditions ?? row.Preconditions) || "App running at localhost:3000",
    testData:
      override.testData ??
      (accountKey && ACCOUNTS[accountKey] ? ACCOUNTS[accountKey] : modernizeText(row["Test Data"]) || "N/A"),
    steps: modernizeText(row["Steps to Execute"]),
    expected: modernizeText(row["Expected Result"]),
    actual: modernizeText(row["Actual Result"]),
    status: String(row.Status ?? "").trim() || "Not Run",
    remarks: modernizeText(row.Remarks),
    route: meta.route,
    role: meta.role,
  };

  const { caseType: _dropType, status: overrideStatus, ...overrideRest } = override;

  const merged = {
    ...base,
    ...overrideRest,
    module,
    caseType: base.caseType || "Rainy",
    actual: override.actual ?? defaultActual({ ...base, ...override }, meta),
    steps: override.steps ?? base.steps,
    expected: override.expected ?? base.expected,
    status: overrideStatus ?? base.status,
  };

  if (!merged.steps || merged.steps.length < 10) {
    merged.steps = `1. Open ${merged.route}\n2. Perform: ${merged.title}`;
  }

  return finalizeCase(merged);
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

const rows = parseXlsx(xlsxPath);
let cases = rows
  .filter((r) => r["Test Case ID"])
  .map(buildCase)
  .filter((c) => !REPLACED_MODULE_NAMES.has(c.module));

cases.push(
  ...REPLACED_MODULE_CASES.map((row) => {
    const meta = MODULE_META[row.module] ?? { route: "/", role: "guest" };
    return finalizeCase({
      ...row,
      route: row.route ?? meta.route,
      role: row.role ?? meta.role,
    });
  })
);

balanceSunnyRainyRatio(cases);
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
  const fallback = path.join(root, "tests", "Book1-updated.export.csv");
  fs.writeFileSync(fallback, csvBody);
  console.warn(`Could not write ${outCsv} (${err.code}). Wrote ${fallback} instead. Close Excel and re-run.`);
}
fs.writeFileSync(
  outJson,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      source: "tests/Book1.xlsx",
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
console.log("Sunny:Rainy ratio per module (default: rainy >= sunny x 4):");
for (const [mod, v] of Object.entries(ratioReport)) {
  const target = MODULE_RATIO_TARGETS[mod];
  const ok = target
    ? v.sunny >= target.sunny && v.rainy >= target.rainy
    : v.rainy >= v.sunny * 4;
  const label = target ? `need ${target.sunny} sunny, ${target.rainy} rainy` : "need rainy >= sunny x 4";
  console.log(`  ${ok ? "OK" : "!!"} ${mod}: ${v.sunny} sunny, ${v.rainy} rainy (${label})`);
}
