"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { revalidatePath } from "next/cache";

export async function updateCustomerProfile(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) return { error: "Not authenticated" };

  const fullName = formData.get("full_name") as string;
  const phone = formData.get("phone") as string;

  const { error } = await supabase.auth.updateUser({
    data: { name: fullName, phone },
  });

  if (error) return { error: error.message };

  revalidatePath("/customer/profile");
  return { success: true };
}