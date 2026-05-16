// Source: `src/app/(customer)/dashboard/page.tsx`

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { getUserNameById } from "@/features/users/queries/getUserName";
import type { CustomerDashboardPageData } from "@/features/customers/types";

export async function getCustomerDashboardPage(): Promise<CustomerDashboardPageData | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  const userName = await getUserNameById(session.user.id);

  return {
    welcomeName: userName || session.user.email || "",
  };
}

export async function requireCustomerDashboardPage(): Promise<CustomerDashboardPageData> {
  const data = await getCustomerDashboardPage();
  if (!data) {
    redirect("/login");
  }
  return data;
}
