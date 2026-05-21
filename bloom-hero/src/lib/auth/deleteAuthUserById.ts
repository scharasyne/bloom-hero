import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";

export async function deleteAuthUserById(userId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabaseAdmin = createSupabaseAdminClient();
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
