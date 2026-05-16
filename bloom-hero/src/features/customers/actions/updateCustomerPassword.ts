"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";

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
