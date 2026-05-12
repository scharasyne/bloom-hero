import { RequestedLocationRank } from "../types";

export function buildLocationRanking(locations: string[]): RequestedLocationRank[] {
  const counts = new Map<string, number>();
  for (const raw of locations) {
    const location = (raw || "").trim();
    if (!location) continue;
    counts.set(location, (counts.get(location) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count || a.location.localeCompare(b.location));
}