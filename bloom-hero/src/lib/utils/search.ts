export type SearchScope = "all" | "flowers" | "vendors";

export function normalizeSearchScope(value: string | null): SearchScope {
  if (value === "flowers" || value === "vendors" || value === "all") {
    return value;
  }
  return "all";
}
