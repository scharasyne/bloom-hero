import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function getCustomerSettingsByUserId(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("customers")
    .select("shipping_address, profile_photo_url, notification_preferences")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}