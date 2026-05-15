import { redirect } from "next/navigation";
import { AdminDashboardPageView } from "@/features/admin/components/AdminDashboardPageView";
import { getAdminDashboardData } from "@/features/admin/queries/getAdminDashboardData";

export default async function AdminDashboardPage() {
  const data = await getAdminDashboardData();
  if (!data) redirect("/login");

  return <AdminDashboardPageView data={data} />;
}
