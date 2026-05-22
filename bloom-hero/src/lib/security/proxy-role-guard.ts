import type { SupabaseClient } from "@supabase/supabase-js";

type AppRole = "admin" | "vendor" | "customer";

export async function getUserAppRole(
  supabase: SupabaseClient,
  userId: string,
): Promise<AppRole | null> {
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .maybeSingle<{ role: string | null }>();

  const role = profile?.role;
  if (role === "admin" || role === "vendor" || role === "customer") {
    return role;
  }

  return null;
}

export function roleHomePath(role: AppRole | null): string {
  if (role === "admin") return "/admin/dashboard";
  if (role === "vendor") return "/vendor/dashboard";
  return "/";
}
