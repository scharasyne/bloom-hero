// Source: `src/app/(customer)/vendor-application/actions.ts` (uploadVendorApplicationDocument only)

"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { uploadVendorDocument } from "@/features/vendors/actions/uploadVendorDocument";

export async function uploadVendorApplicationDocument(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { ok: false as const, error: "You need to log in again." };

  const file = formData.get("file");
  const documentType = formData.get("documentType");
  if (!(file instanceof File) || typeof documentType !== "string") {
    return { ok: false as const, error: "Invalid upload payload." };
  }

  try {
    const publicUrl = await uploadVendorDocument(session.user.id, file, documentType);
    return { ok: true as const, publicUrl };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Failed to upload document.",
    };
  }
}
