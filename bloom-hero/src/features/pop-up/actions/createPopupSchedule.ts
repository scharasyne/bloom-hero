"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { CreatePopUpScheduleInput, PopUpSchedule } from "../types";
import { toIsoDateTime } from "../utils/toIsoDateTime";

export async function createPopUpSchedule(input: CreatePopUpScheduleInput) {
  const supabase = await createSupabaseServerClient();
  const cleanLandmark = input.landmark?.trim();
  const cleanLocation = input.location.trim();
  const finalLocation = cleanLandmark
    ? `${cleanLocation} - ${cleanLandmark}`
    : cleanLocation;
  const scheduledDateIso = toIsoDateTime(input.scheduledDate, "00:00");
  const startTimeIso = input.startTime ? toIsoDateTime(input.scheduledDate, input.startTime) : null;
  const endTimeIso = input.endTime ? toIsoDateTime(input.scheduledDate, input.endTime) : null;

  if (!scheduledDateIso) {
    return { success: false, error: "Invalid date." };
  }

  const { data, error } = await supabase
    .from("popup_locations")
    .insert({
      vendor_id: input.vendorId,
      location: finalLocation,
      scheduled_date: scheduledDateIso,
      start_time: startTimeIso,
      end_time: endTimeIso,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
    })
    .select("id, location, scheduled_date, start_time, end_time, latitude, longitude")
    .single();

  if (error) {
    console.error("Error creating pop-up schedule:", error);
    return { success: false, error: error.message };
  }

  return { success: true, data: data as PopUpSchedule };
}