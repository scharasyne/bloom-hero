"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { PopUpMapVendor } from "@/typess";

interface PopUpLocationRow {
  id: string;
  location: string;
  scheduled_date: string;
  start_time: string | null;
  end_time: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  vendors: {
    shop_name: string | null;
  } | null;
}

function formatShortDate(value: string | null) {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
  }).format(date);
}

function parseCoordinate(value: number | string | null) {
  if (value === null || value === undefined) return null;

  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return null;

  return parsed;
}

export async function getPopUpMapVendors(): Promise<PopUpMapVendor[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("popup_locations")
    .select("id, location, scheduled_date, start_time, end_time, latitude, longitude, vendors!inner(shop_name)")
    .order("scheduled_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Failed to fetch popup map vendors:", error.message);
    return [];
  }

  return ((data ?? []) as unknown as PopUpLocationRow[])
    .map((row, index) => {
      const lat = parseCoordinate(row.latitude);
      const lng = parseCoordinate(row.longitude);

      if (lat === null || lng === null) return null;

      const startSource = row.start_time ?? row.scheduled_date;
      const endSource = row.end_time ?? row.scheduled_date;

      return {
        id: row.id,
        displayNumber: index + 1,
        name: row.vendors?.shop_name?.trim() || "Pop-up Store",
        address: row.location,
        startDate: formatShortDate(startSource),
        endDate: formatShortDate(endSource),
        lat,
        lng,
      };
    })
    .filter((vendor): vendor is PopUpMapVendor => vendor !== null);
}
