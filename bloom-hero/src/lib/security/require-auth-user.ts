import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export type AuthUserResult =
  | { ok: true; userId: string; email: string | undefined }
  | { ok: false; error: string };

export async function requireAuthUser(): Promise<AuthUserResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { ok: false, error: "You need to log in again." };
  }

  return { ok: true, userId: user.id, email: user.email };
}
