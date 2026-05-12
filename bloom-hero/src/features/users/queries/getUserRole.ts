import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function getUserRoleById(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("users").select("role").eq("id", userId).maybeSingle();
  if (error) throw new Error(error.message);
  return data?.role as string | undefined;
}