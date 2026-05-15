import AdminSidebarNav from "@/features/admin/components/AdminSidebarNav";
import { requireRole } from "@/features/auth/utils/require-role";
import { getAdminNavAlertCounts } from "@/features/admin/queries/getAdminNavAlertCounts";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["admin"]);
  const alertCounts = await getAdminNavAlertCounts();

  return (
    <div className="min-h-screen bg-[#fbf7f4] text-[#1f1f1f] md:flex">
      <AdminSidebarNav alertCounts={alertCounts} />
      <main className="flex-1 min-w-0 px-4 pt-[calc(3.5rem+1rem)] pb-[calc(4.5rem+1rem+env(safe-area-inset-bottom,0px))] sm:px-6 md:px-6 md:pt-6 md:pb-6 lg:px-8 lg:py-6 xl:px-10">
        <div className="mx-auto w-full max-w-[1440px]">{children}</div>
      </main>
    </div>
  );
}
