// Source: `src/app/(customer)/settings/actions.ts` (uploadCustomerPhoto only)

"use server";

import { uploadCustomerProfilePhoto } from "@/features/customers/actions/uploadCustomerProfile";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

/**
 * 
 * REDUNDANT GET CURRENT SESSION USER ID. 
 * WE ALREADY HAVE ONE
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
