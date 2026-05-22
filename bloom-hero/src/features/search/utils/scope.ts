export type SearchScope = "all" | "flowers" | "vendors" | "popups";

export function normalizeSearchScope(value: string | null): SearchScope {
  if (value === "flowers" || value === "vendors" || value === "all" || value === "popups") {
    return value;
  }
  return "all";
}
