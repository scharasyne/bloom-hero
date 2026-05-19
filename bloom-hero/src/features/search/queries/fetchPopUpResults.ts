import type { SearchPopUpRow } from "@/features/search/types";
import {
  isPopUpHappening,
  isPopUpUpcoming,
  normalizePopUpCity,
  normalizePopUpSort,
  normalizePopUpTiming,
  startOfToday,
  type PopUpSort,
  type PopUpTiming,
} from "@/features/search/utils/popupFilters";
import type { PopUpLocationRow } from "@/features/pop-up/types";
import { createSearchSupabaseClient } from "@/features/search/utils/searchSupabase";

type SearchClient = Awaited<ReturnType<typeof createSearchSupabaseClient>>;

function formatPopUpDate(value: string | null) {
  if (!value) return "Date TBD";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date TBD";
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatPopUpTime(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-PH", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function sortPopUps(rows: SearchPopUpRow[], sort: PopUpSort) {
  const copy = [...rows];
  if (sort === "Name") {
    copy.sort((a, b) => (a.shop_name ?? "").localeCompare(b.shop_name ?? ""));
    return copy;
  }

  copy.sort((a, b) => {
    const aDate = new Date(a.scheduled_date).getTime();
    const bDate = new Date(b.scheduled_date).getTime();
    if (aDate !== bDate) {
      return sort === "Latest" ? bDate - aDate : aDate - bDate;
    }
    const aTime = a.start_time ? new Date(a.start_time).getTime() : 0;
    const bTime = b.start_time ? new Date(b.start_time).getTime() : 0;
    return sort === "Latest" ? bTime - aTime : aTime - bTime;
  });

  return copy;
}

export async function fetchPopUpResults(
  supabase: SearchClient,
  query: string,
  city: string,
  timing: PopUpTiming,
  sort: PopUpSort
) {
  const normalizedCity = normalizePopUpCity(city);
  const normalizedTiming = normalizePopUpTiming(timing);
  const normalizedSort = normalizePopUpSort(sort);
  const today = startOfToday();
  const todayIso = today.toISOString().slice(0, 10);

  let builder = supabase
    .from("popup_locations")
    .select(
      "id, vendor_id, location, scheduled_date, start_time, end_time, latitude, longitude, vendors!inner(id, shop_name, business_type, holds_popups)"
    );

  if (normalizedTiming === "upcoming") {
    builder = builder.gte("scheduled_date", todayIso);
  } else if (normalizedTiming === "happening") {
    builder = builder.lte("scheduled_date", todayIso);
  }

  if (query) {
    const pattern = `%${query}%`;
    builder = builder.ilike("location", pattern);
  }

  if (normalizedCity !== "Any") {
    builder = builder.ilike("location", `%${normalizedCity}%`);
  }

  builder = builder
    .order("scheduled_date", { ascending: normalizedSort !== "Latest" })
    .order("start_time", { ascending: normalizedSort !== "Latest" })
    .limit(200);

  const { data, error } = await builder;

  if (error) {
    return { data: [] as SearchPopUpRow[], error };
  }

  let rows = ((data ?? []) as unknown as PopUpLocationRow[])
    .filter((row) => {
      if (!row.vendor_id) return false;
      const vendor = row.vendors as { business_type?: string | null; holds_popups?: boolean | null } | null;
      if (vendor?.business_type === "unregistered") return true;
      return Boolean(vendor?.holds_popups ?? true);
    })
    .map((row) => {
      const endRaw = row.end_time ?? row.scheduled_date;
      const happening = isPopUpHappening(row.scheduled_date, endRaw, today);
      const upcoming = isPopUpUpcoming(row.scheduled_date, today);

      return {
        id: row.id,
        vendor_id: row.vendor_id,
        shop_name: row.vendors?.shop_name?.trim() || "Pop-up vendor",
        business_type: row.vendors?.business_type ?? "pop-up",
        location: row.location,
        scheduled_date: row.scheduled_date,
        start_time: row.start_time,
        end_time: row.end_time,
        latitude: row.latitude,
        longitude: row.longitude,
        start_label: formatPopUpDate(row.start_time ?? row.scheduled_date),
        end_label: formatPopUpDate(endRaw),
        time_label: formatPopUpTime(row.start_time),
        status: happening ? ("happening" as const) : upcoming ? ("upcoming" as const) : ("past" as const),
      };
    });

  if (normalizedTiming === "upcoming") {
    rows = rows.filter((row) => row.status === "upcoming");
  } else if (normalizedTiming === "happening") {
    rows = rows.filter((row) => row.status === "happening");
  } else {
    rows = rows.filter((row) => row.status !== "past");
  }

  if (query) {
    const lowered = query.toLowerCase();
    rows = rows.filter(
      (row) =>
        row.location.toLowerCase().includes(lowered) ||
        (row.shop_name ?? "").toLowerCase().includes(lowered)
    );
  }

  return { data: sortPopUps(rows, normalizedSort), error: null };
}
