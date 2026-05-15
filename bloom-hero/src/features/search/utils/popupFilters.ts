export type PopUpTiming = "upcoming" | "happening" | "all";

export type PopUpSort = "Earliest" | "Latest" | "Name";

export const POPUP_CITY_OPTIONS = [
  "Any",
  "Cebu City",
  "Mandaue",
  "Lapu-Lapu",
  "Talisay",
  "Consolacion",
  "Liloan",
  "Carcar",
] as const;

export const POPUP_TIMING_OPTIONS: { value: PopUpTiming; label: string }[] = [
  { value: "upcoming", label: "Upcoming" },
  { value: "happening", label: "Happening now" },
  { value: "all", label: "All dates" },
];

export const POPUP_SORT_OPTIONS: PopUpSort[] = ["Earliest", "Latest", "Name"];

export function normalizePopUpCity(value: string | null): string {
  if (value && POPUP_CITY_OPTIONS.includes(value as (typeof POPUP_CITY_OPTIONS)[number])) {
    return value;
  }
  return "Any";
}

export function normalizePopUpTiming(value: string | null): PopUpTiming {
  if (value === "happening" || value === "all") return value;
  return "upcoming";
}

export function normalizePopUpSort(value: string | null): PopUpSort {
  if (value === "Latest" || value === "Name") return value;
  return "Earliest";
}

export function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function parsePopUpDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}

export function isPopUpHappening(
  scheduledDate: string,
  endRaw: string | null,
  today = startOfToday()
) {
  const start = parsePopUpDate(scheduledDate);
  const end = parsePopUpDate(endRaw ?? scheduledDate);
  if (!start) return false;
  return start <= today && (end === null || end >= today);
}

export function isPopUpUpcoming(scheduledDate: string, today = startOfToday()) {
  const start = parsePopUpDate(scheduledDate);
  if (!start) return false;
  return start > today;
}
