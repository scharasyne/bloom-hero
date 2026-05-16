import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function updateUserProfile(userId: string, input: { name: string; contactNumber: string }) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("users")
    .update({
      name: input.name,
      contact_number: input.contactNumber,
    })
    .eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }
}