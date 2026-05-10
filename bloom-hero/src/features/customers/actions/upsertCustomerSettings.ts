import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type NotificationPreferences = {
  order_updates: boolean;
  promotions: boolean;
};

export async function upsertCustomerSettingsByUserId(
  userId: string,
  input: {
    shippingAddress: string;
    profilePhotoUrl: string;
    notificationPreferences: NotificationPreferences;
  }
) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("customers").upsert(
    {
      user_id: userId,
      shipping_address: input.shippingAddress,
      profile_photo_url: input.profilePhotoUrl || null,
      notification_preferences: input.notificationPreferences,
    },
    { onConflict: "user_id" }
  );

  if (error) {
    throw new Error(error.message);
  }
}
