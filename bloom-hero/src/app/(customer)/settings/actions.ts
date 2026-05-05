"use server";

import { revalidatePath } from "next/cache";

import {
  upsertCustomerSettingsByUserId,
  uploadCustomerProfilePhoto,
} from "@/lib/services/customers";
import { updateUserProfile } from "@/lib/services/users";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type NotificationPreferences = {
  order_updates: boolean;
  promotions: boolean;
};

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

export async function updateCustomerEmail(email: string) {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.updateUser({
      email,
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      ok: true as const,
      message:
        "Email update initiated. Please check your inbox and confirm the new email address.",
    };
  } catch (error) {
    return {
      ok: false as const,
      message: error instanceof Error ? error.message : "Failed to update email.",
    };
  }
}

export async function updateCustomerPassword(password: string) {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      throw new Error(error.message);
    }

    return { ok: true as const, message: "Password updated successfully." };
  } catch (error) {
    return {
      ok: false as const,
      message: error instanceof Error ? error.message : "Failed to update password.",
    };
  }
}

export async function uploadCustomerPhoto(formData: FormData) {
  try {
    const userId = await getCurrentSessionUserId();
    const file = formData.get("photo");

    if (!(file instanceof File)) {
      return { ok: false as const, message: "No file selected." };
    }

    const publicUrl = await uploadCustomerProfilePhoto(userId, file);
    return { ok: true as const, publicUrl };
  } catch (error) {
    return {
      ok: false as const,
      message:
        error instanceof Error
          ? error.message
          : "Failed to upload photo. Check storage bucket setup.",
    };
  }
}
