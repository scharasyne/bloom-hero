// Source: `src/app/(customer)/settings/actions.ts` (saveCustomerSettings only)

"use server";

import { revalidatePath } from "next/cache";

import { getAuthUser } from "@/features/auth/queries/getAuthUser";
import { revalidateUserCache } from "@/features/auth/utils/revalidateUserCache";
import { upsertCustomerSettingsByUserId } from "@/features/customers/actions/upsertCustomerSettings";
import { updateUserProfile } from "@/features/users/actions/updateUserProfile";

type NotificationPreferences = {
  order_updates: boolean;
  promotions: boolean;
};


export async function saveCustomerSettings(input: {
  name: string;
  contactNumber: string;
  shippingAddress: string;
  profilePhotoUrl: string;
  notificationPreferences: NotificationPreferences;
}) {
  try {
    const user = await getAuthUser();
    if (!user) {
      throw new Error("Please log in again to continue.");
    }
    const userId = user.id;

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

    await revalidateUserCache(userId);
    revalidatePath("/settings");
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      message: error instanceof Error ? error.message : "Failed to save profile.",
    };
  }
}
