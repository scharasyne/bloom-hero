import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function getUserNameById(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("users")
    .select("name")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data?.name ?? null;
}
