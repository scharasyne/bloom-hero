"use server";

import { getPopupLocationsWithVendor } from "@/features/pop-up/queries/getPopupLocation";
import type { PopUpLocationRow } from "@/features/pop-up/types";
import { PopUpMapVendor } from "@/types";

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
  let data: PopUpLocationRow[] = [];
  try {
    data = await getPopupLocationsWithVendor();
  } catch (error) {
    console.error(
      "Failed to fetch popup map vendors:",
      error instanceof Error ? error.message : "unknown error"
    );
    return [];
  }

  return data
    .map((row, index) => {
      const lat = parseCoordinate(row.latitude);
      const lng = parseCoordinate(row.longitude);

      if (lat === null || lng === null) return null;

      const startSource = row.start_time ?? row.scheduled_date;
      const endSource = row.end_time ?? row.scheduled_date;

      return {
        id: row.id,
        vendorId: row.vendor_id,
        displayNumber: index + 1,
        name: row.vendors?.shop_name?.trim() || "Pop-up Store",
        address: row.location,
        scheduledDate: row.scheduled_date,
        endRaw: row.end_time ?? row.scheduled_date,
        startDate: formatShortDate(startSource),
        endDate: formatShortDate(endSource),
        lat,
        lng,
      };
    })
    .filter((vendor): vendor is NonNullable<typeof vendor> => vendor !== null);
}
