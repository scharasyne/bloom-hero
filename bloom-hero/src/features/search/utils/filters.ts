/** Maps UI price label to API/DB filter token. */
export function mapPriceFilter(value: string) {
  const trimmed = value.trim();
  if (trimmed === "Under P500") return "<500";
  if (trimmed === "P500-700") return "500-700";
  if (trimmed === "Over P700") return ">700";
  if (trimmed === "Over P500") return ">500";
  if (trimmed === "Under P700") return "<700";
  if (trimmed === "Default") return "Any";
  return "Any";
}

/** Normalizes price tokens from query strings before querying. */
export function normalizeSearchPrice(value: string | null | undefined) {
  const raw = (value ?? "Any").trim();
  if (raw === "Any" || raw === "<100000") return "Any";
  if (raw === "<500" || raw === ">500" || raw === "<700" || raw === "500-700" || raw === ">700") {
    return raw;
  }
  return "Any";
}
