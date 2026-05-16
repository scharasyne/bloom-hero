import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function upsertUserAsCustomer(userId: string, email: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("users").upsert(
    {
      id: userId,
      email,
      role: "customer",
    },
    { onConflict: "id" }
  );
  if (error) throw new Error(error.message);
}