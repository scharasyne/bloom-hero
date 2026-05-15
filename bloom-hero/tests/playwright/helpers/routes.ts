/** Public routes (no auth required). */
export const PUBLIC_ROUTES = [
  { path: "/", title: /bloom/i },
  { path: "/about-us" },
  { path: "/login" },
  { path: "/sign-up" },
  { path: "/forgot-password" },
  { path: "/search" },
  { path: "/map", title: /pop-up map/i },
  { path: "/cart" },
] as const;

/** Middleware-protected prefixes (unauthenticated → /login). */
export const PROXY_PROTECTED_ROUTES = [
  "/admin/dashboard",
  "/orders",
  "/dashboard",
  "/profile",
  "/review",
  "/vendor-application",
] as const;

export const ADMIN_ROUTES = [
  { path: "/admin/dashboard", heading: /approve vendor applications/i },
  { path: "/admin/vendor-applications", heading: "Vendor Applications" },
  { path: "/admin/vendors", heading: "Vendors" },
  { path: "/admin/review-moderation", heading: "Review Moderation" },
  { path: "/admin/activity-logs", heading: /activity/i },
] as const;

export const VENDOR_ROUTES = [
  { path: "/vendor/dashboard", heading: "Dashboard" },
  { path: "/vendor/schedule", heading: null },
  { path: "/vendor/profile", heading: null },
  { path: "/vendor/products", heading: null },
  { path: "/vendor/orders", heading: "Orders" },
  { path: "/vendor/settings", heading: null },
] as const;

export const CUSTOMER_ROUTES = [
  { path: "/dashboard", heading: null },
  { path: "/orders", heading: "Purchase History" },
  { path: "/profile", heading: null },
  { path: "/settings", heading: null },
] as const;

/** Post-login landing URLs (current app behavior). */
export const ROLE_HOME: Record<"admin" | "vendor" | "customer" | "unregistered", RegExp> = {
  admin: /\/admin\/dashboard/,
  vendor: /\/vendor\/dashboard/,
  unregistered: /\/vendor\/dashboard/,
  customer: /^\/$|\/dashboard/,
};

/** Legacy URLs redirect to unified vendor routes (next.config.ts). */
export const LEGACY_VENDOR_REDIRECTS = [
  "/pop-up/dashboard",
  "/market/dashboard",
  "/pop-up/schedule",
  "/market/products",
] as const;
