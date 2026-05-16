import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function ensureCustomerByUserId(userId: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("customers")
    .upsert({ user_id: userId }, { onConflict: "user_id" })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
}