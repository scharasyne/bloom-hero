import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function updateUserRoleAndContact(userId: string, contactNumber: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("users")
    .update({ role: "customer", contact_number: contactNumber })
    .eq("id", userId);
  if (error) throw new Error(error.message);
}