// Source: `src/app/(customer)/profile/actions.ts`

"use server";

import { revalidatePath } from "next/cache";

import { getAuthUser } from "@/features/auth/queries/getAuthUser";
import { revalidateUserCache } from "@/features/auth/utils/revalidateUserCache";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function updateCustomerProfile(formData: FormData) {
  const user = await getAuthUser();
  if (!user) return { error: "Not authenticated" };

  const supabase = await createSupabaseServerClient();
  const fullName = formData.get("full_name") as string;
  const phone = formData.get("phone") as string;

  const { error } = await supabase.auth.updateUser({
    data: { name: fullName, phone },
  });

  if (error) return { error: error.message };

  await revalidateUserCache(user.id);
  revalidatePath("/customer/profile");
  return { success: true };
}
