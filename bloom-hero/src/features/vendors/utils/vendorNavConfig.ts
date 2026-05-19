export const VENDOR_NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", href: "/vendor/dashboard", icon: "mdi:home-outline" },
  { id: "products", label: "Products", href: "/vendor/products", icon: "mdi:package-variant" },
  { id: "orders", label: "Orders", href: "/vendor/orders", icon: "mdi:clipboard-list-outline" },
  { id: "profile", label: "Profile", href: "/vendor/profile", icon: "mdi:account-outline" },
  { id: "schedule", label: "Schedule", href: "/vendor/schedule", icon: "mdi:calendar-outline" },
  { id: "settings", label: "Settings", href: "/vendor/settings", icon: "mdi:cog-outline" },
] as const;

export type VendorNavItemId = (typeof VENDOR_NAV_ITEMS)[number]["id"];
