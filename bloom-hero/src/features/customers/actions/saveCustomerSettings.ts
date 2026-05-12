// Source: `src/app/(customer)/settings/actions.ts` (saveCustomerSettings only)

"use server";

import { revalidatePath } from "next/cache";

import { upsertCustomerSettingsByUserId } from "@/features/customers/actions/upsertCustomerSettings";
import { updateUserProfile } from "@/features/users/actions/updateUserProfile";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type NotificationPreferences = {
  order_updates: boolean;
  promotions: boolean;
};


/*
  —————————————————— CHECK THIS ——————————————————
  A BIT REDUNDANT. WE ALREADY HAVE A CURRENT SESSION ID
  USE THAT. FIND THE FILE.
*/
async function getCurrentSessionUserId() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Please log in again to continue.");
  }

  return session.user.id;
}

export async function saveCustomerSettings(input: {
  name: string;
  contactNumber: string;
  shippingAddress: string;
  profilePhotoUrl: string;
  notificationPreferences: NotificationPreferences;
}) {
  try {
    const userId = await getCurrentSessionUserId();

    await Promise.all([
      updateUserProfile(userId, {
        name: input.name,
        contactNumber: input.contactNumber,
      }),
      upsertCustomerSettingsByUserId(userId, {
        shippingAddress: input.shippingAddress,
        profilePhotoUrl: input.profilePhotoUrl,
        notificationPreferences: input.notificationPreferences,
      }),
    ]);

    revalidatePath("/settings");
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      message: error instanceof Error ? error.message : "Failed to save profile.",
    };
  }
}
