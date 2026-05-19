import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export type EnsureAdminResult =
  | {
      supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
      adminId: string;
      error: null;
    }
  | {
      supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
      adminId: null;
      error: string;
    };

export async function ensureAdmin(): Promise<EnsureAdminResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { supabase, adminId: null, error: "You must be logged in as an admin." };
  }

  const { data: profile, error: roleError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<{ role: string | null }>();

  if (roleError || profile?.role !== "admin") {
    return { supabase, adminId: null, error: "Only admins can perform this action." };
  }

  return { supabase, adminId: user.id, error: null };
}
