"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type ActionResult = { ok: boolean; error?: string };

function toIsoDateTime(date: string, time: string) {
  const parsed = new Date(`${date}T${time}:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

export async function createPopUpProfileSchedule(input: {
  location: string;
  scheduledDate: string;
  startTime?: string | null;
  endTime?: string | null;
}): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "You must be logged in." };

  const { data: vendor, error: vendorError } = await supabase
    .from("vendors")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle<{ id: string }>();

  if (vendorError || !vendor) {
    return { ok: false, error: vendorError?.message ?? "Vendor profile not found." };
  }

  const cleanLocation = input.location.trim();
  if (!cleanLocation || !input.scheduledDate) {
    return { ok: false, error: "Location and date are required." };
  }

  const scheduledDateIso = toIsoDateTime(input.scheduledDate, "00:00");
  const startTimeIso = input.startTime ? toIsoDateTime(input.scheduledDate, input.startTime) : null;
  const endTimeIso = input.endTime ? toIsoDateTime(input.scheduledDate, input.endTime) : null;
  if (!scheduledDateIso) {
    return { ok: false, error: "Invalid schedule date." };
  }

  const { error } = await supabase.from("popup_locations").insert({
    vendor_id: vendor.id,
    location: cleanLocation,
    scheduled_date: scheduledDateIso,
    start_time: startTimeIso,
    end_time: endTimeIso,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/vendor/profile");
  revalidatePath("/vendor/schedule");
  return { ok: true };
}
