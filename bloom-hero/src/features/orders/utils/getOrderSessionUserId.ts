// Source: `src/app/actions/order-status.ts`

import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function getOrderSessionUserId() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    throw new Error("Please sign in to continue.");
  }

  return { supabase, userId: session.user.id };
}
