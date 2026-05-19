// Source: `src/app/(customer)/dashboard/page.tsx`

import { redirect } from "next/navigation";
import { getAuthUser } from "@/features/auth/queries/getAuthUser";
import { getUserNameById } from "@/features/users/queries/getUserName";
import type { CustomerDashboardPageData } from "@/features/customers/types";

export async function getCustomerDashboardPage(): Promise<CustomerDashboardPageData | null> {
  const user = await getAuthUser();
  if (!user) {
    return null;
  }

  const userName = await getUserNameById(user.id);

  return {
    welcomeName: userName || user.email || "",
  };
}

export async function requireCustomerDashboardPage(): Promise<CustomerDashboardPageData> {
  const data = await getCustomerDashboardPage();
  if (!data) {
    redirect("/login");
  }
  return data;
}
