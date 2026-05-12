"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";

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
