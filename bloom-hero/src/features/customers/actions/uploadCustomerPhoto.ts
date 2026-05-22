// Source: `src/app/(customer)/settings/actions.ts` (uploadCustomerPhoto only)

"use server";

import { uploadCustomerProfilePhoto } from "@/features/customers/actions/uploadCustomerProfile";
import { RateLimitError, enforceRateLimit } from "@/lib/security/enforce-rate-limit";
import { requireAuthUser } from "@/lib/security/require-auth-user";

export async function uploadCustomerPhoto(formData: FormData) {
  try {
    const auth = await requireAuthUser();
    if (!auth.ok) {
      return { ok: false as const, message: auth.error };
    }
    const userId = auth.userId;
    await enforceRateLimit("upload-api", userId);
    const file = formData.get("photo");

    if (!(file instanceof File)) {
      return { ok: false as const, message: "No file selected." };
    }

    const publicUrl = await uploadCustomerProfilePhoto(userId, file);
    return { ok: true as const, publicUrl };
  } catch (error) {
    if (error instanceof RateLimitError) {
      return { ok: false as const, message: error.message };
    }

    return {
      ok: false as const,
      message:
        error instanceof Error
          ? error.message
          : "Failed to upload photo. Check storage bucket setup.",
    };
  }
}
