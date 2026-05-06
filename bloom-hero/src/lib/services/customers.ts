import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type NotificationPreferences = {
  order_updates: boolean;
  promotions: boolean;
};

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

export async function uploadCustomerProfilePhoto(userId: string, file: File) {
  const supabase = await createSupabaseServerClient();
  const extension = file.name.split(".").pop() || "jpg";
  const filePath = `${userId}/avatar-${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("profile-photos")
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage.from("profile-photos").getPublicUrl(filePath);
  if (!data?.publicUrl) {
    throw new Error("Photo upload succeeded but no public URL was returned.");
  }

  return data.publicUrl;
}

export async function ensureCustomerByUserId(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("customers").upsert({ user_id: userId }, { onConflict: "user_id" });
  if (error) throw new Error(error.message);
}
