"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { deleteAuthUserById } from "@/lib/auth/deleteAuthUserById";
import { getAuthUser } from "@/features/auth/queries/getAuthUser";
import { getUserRoleById } from "@/features/users/queries/getUserRole";

export async function deleteMyAccount(input: {
  password: string;
  confirmText: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (input.confirmText.trim() !== "DELETE") {
    return { ok: false, error: 'Type DELETE to confirm.' };
  }
  if (!input.password) {
    return { ok: false, error: "Enter your password." };
  }

  const user = await getAuthUser();
  if (!user?.email) {
    return { ok: false, error: "You must be signed in." };
  }

  const role = await getUserRoleById(user.id);
  if (role === "admin") {
    return { ok: false, error: "Admin accounts cannot be deleted here." };
  }

  const supabase = await createSupabaseServerClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: input.password,
  });
  if (signInError) {
    return { ok: false, error: "Incorrect password." };
  }

  const deleted = await deleteAuthUserById(user.id);
  if (!deleted.ok) {
    return deleted;
  }

  await supabase.auth.signOut();
  return { ok: true };
}
