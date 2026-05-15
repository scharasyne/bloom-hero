// Source: `src/app/actions/order-status.ts`

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { getAuthUser } from "@/features/auth/queries/getAuthUser";

export async function getOrderSessionUserId() {
  const supabase = await createSupabaseServerClient();
  const user = await getAuthUser();

  if (!user?.id) {
    throw new Error("Please sign in to continue.");
  }

  return { supabase, userId: user.id };
}
