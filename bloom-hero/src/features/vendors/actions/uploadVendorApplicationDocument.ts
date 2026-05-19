// Source: `src/app/(customer)/vendor-application/actions.ts` (uploadVendorApplicationDocument only)

"use server";

import { RateLimitError, enforceRateLimit } from "@/lib/security/enforce-rate-limit";
import { requireAuthUser } from "@/lib/security/require-auth-user";
import { uploadVendorDocument } from "@/features/vendors/actions/uploadVendorDocument";

export async function uploadVendorApplicationDocument(formData: FormData) {
  const auth = await requireAuthUser();
  if (!auth.ok) return { ok: false as const, error: auth.error };

  try {
    await enforceRateLimit("upload-api", auth.userId);
  } catch (error) {
    if (error instanceof RateLimitError) {
      return { ok: false as const, error: error.message };
    }
    throw error;
  }

  const file = formData.get("file");
  const documentType = formData.get("documentType");
  if (!(file instanceof File) || typeof documentType !== "string") {
    return { ok: false as const, error: "Invalid upload payload." };
  }

  try {
    const publicUrl = await uploadVendorDocument(auth.userId, file, documentType);
    return { ok: true as const, publicUrl };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Failed to upload document.",
    };
  }
}
