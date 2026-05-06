// app/(admin)/layout.tsx
import AdminSidebarNav from "@/components/admin/AdminSidebarNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#fbf7f4] text-[#1f1f1f] md:flex">
      <AdminSidebarNav />

      <main className="flex-1 min-w-0 px-4 py-4 sm:px-6 lg:px-8 lg:py-6 xl:px-10">
        <div className="mx-auto max-w-[1440px]">
          {children}
        </div>
      </main>
    </div>
  );
}