"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { ensureCustomerByUserId } from "@/features/customers/actions/ensureCustomer";
import { getUserRoleById } from "@/features/users/queries/getUserRole";
import { upsertUserAsCustomer } from "@/features/users/actions/upsertUserAsCustomer";
import { getVendorProfileByOwnerId } from "@/features/vendors/queries/getVendorProfileByOwnerId";

export async function signInWithPasswordAction(email: string, password: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { ok: false as const, message: error.message };
  }
  return resolvePostLoginDestination();
}

export async function resolvePostLoginDestination() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const, message: "Unable to load your account. Please try again." };
  }

  let role = await getUserRoleById(user.id);
  if (!role) {
    await upsertUserAsCustomer(user.id, user.email ?? "");
    await ensureCustomerByUserId(user.id);
    role = "customer";
  }

  if (role === "admin") return { ok: true as const, path: "/admin/dashboard" };
  if (role === "vendor") {
    const vendor = await getVendorProfileByOwnerId(user.id);
    if (!vendor) {
      return {
        ok: false as const,
        message: "Your account is not registered as a vendor. Please contact support or sign up as a vendor.",
      };
    }
    return { ok: true as const, path: "/vendor/dashboard" };
  }

  return { ok: true as const, path: "/" };
}
