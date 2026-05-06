import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function getUserBasicProfileById(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("users")
    .select("name, email, contact_number")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

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

export async function getUserRoleById(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("users").select("role").eq("id", userId).maybeSingle();
  if (error) throw new Error(error.message);
  return data?.role as string | undefined;
}

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
