import type { BusinessType } from "../types";

export function normalizeBusinessType(value: unknown): BusinessType | null {
  if (value === "registered" || value === "unregistered") return value;
  if (value === "market" || value === "handcrafted") return "registered";
  if (value === "pop-up" || value === "popup" || value === "pop_up") return "unregistered";
  return null;
}

export function formatBusinessTypeLabel(value: BusinessType | null | undefined) {
  if (value === "registered") return "Shop with online orders";
  if (value === "unregistered") return "Pop-up vendor";
  return "Vendor";
}
