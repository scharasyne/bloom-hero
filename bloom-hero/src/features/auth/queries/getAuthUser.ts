import { cache } from "react";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";

/** One verified auth user per request (calls Supabase Auth, not the users table). */
export const getAuthUser = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
});
