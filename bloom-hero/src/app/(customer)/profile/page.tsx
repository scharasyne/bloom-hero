import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import { ProfileForm } from "./_components/profile-form";

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#e6e2dd] px-5 py-5 shadow-sm">
      <div className="flex items-center gap-2 text-gray-400 mb-2">
        {icon}
        <span className="text-[11px] font-semibold uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-2xl font-bold text-[#2f2f2f] tabular-nums">{value}</p>
    </div>
  );
}

export default async function CustomerProfilePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return (
      <>
        <NavBar type="customer" />
        <main className="min-h-screen flex items-center justify-center bg-[#fbf7f4] px-4">
          <div className="bg-white rounded-2xl shadow-lg border border-red-100 px-8 py-10 text-center max-w-md w-full">
            <h1 className="text-xl font-semibold text-[#2f2f2f] mb-2">Sign in to view your profile</h1>
            <a href="/login" className="mt-4 inline-flex items-center justify-center rounded-full bg-[#2f5d3a] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#25492e] transition-colors">
              Go to Login
            </a>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Fetch completed order items for stats
  const { data: orderItems } = await supabase
    .from("order_items")
    .select("quantity, orders!inner(status, total_amount, vendor_id)")
    .eq("orders.customer_id", session.user.id)
    .eq("orders.status", "completed");

  // Fetch review count
  const { count: reviewCount } = await supabase
    .from("reviews")
    .select("*", { count: "exact", head: true })
    .eq("customer_id", session.user.id);

  // Compute stats
  const items = orderItems ?? [];
  const totalStems = items.reduce((sum, i) => sum + (i.quantity || 0), 0);
  const totalSpent = items.reduce((sum, i) => sum + (Number((i.orders as any)?.total_amount) || 0), 0);
  const uniqueVendors = new Set(items.map(i => (i.orders as any)?.vendor_id).filter(Boolean));
  const orderCount = new Set(items.map(i => (i.orders as any)?.id).filter(Boolean)).size;

  // Favourite shop
  const vendorCounts: Record<string, number> = {};
  items.forEach(i => {
    const vid = (i.orders as any)?.vendor_id;
    if (vid) vendorCounts[vid] = (vendorCounts[vid] || 0) + 1;
  });
  const topVendorId = Object.entries(vendorCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  let topVendorName = "None yet";
  if (topVendorId) {
    const { data: vendor } = await supabase
      .from("vendors")
      .select("shop_name")
      .eq("id", topVendorId)
      .single();
    topVendorName = vendor?.shop_name ?? "Unknown Shop";
  }

  const user = session.user;
  const displayName = user.user_metadata?.name ?? "";
  const phone = user.user_metadata?.phone ?? "";
  const memberSince = new Date(user.created_at).toLocaleDateString("en-PH", {
    month: "long", year: "numeric",
  });

  const formatPeso = (n: number) =>
    `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 0 })}`;

  return (
    <>
      <NavBar type="customer" />
      <main className="min-h-screen bg-[#fbf7f4] px-4 sm:px-6 lg:px-8 pb-16">
        <div className="mx-auto w-full max-w-[920px] pt-8 space-y-6">

          {/* Hero card */}
          <div className="bg-white rounded-2xl border border-[#e6e2dd] px-6 sm:px-8 py-8 relative overflow-hidden shadow-sm">
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#f8f5f0] pointer-events-none" />
            <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="h-16 w-16 rounded-full bg-[#eef6ee] border border-[#b8d9b8] flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold text-[#2f5d3a]">
                  {(displayName || user.email || "?").charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#2f2f2f] tracking-tight">
                  {displayName || user.email}
                </h1>
                <p className="text-sm text-gray-400 mt-0.5">Member since {memberSince}</p>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <StatCard
              label="Stems Ordered"
              value={totalStems.toLocaleString("en-PH")}
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22V12M12 12C12 7 17 4 17 4M12 12C12 7 7 4 7 4"/></svg>}
            />
            <StatCard
              label="Total Spent"
              value={formatPeso(totalSpent)}
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>}
            />
            <StatCard
              label="Completed Orders"
              value={orderCount}
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>}
            />
            <StatCard
              label="Shops Visited"
              value={uniqueVendors.size}
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>}
            />
            <StatCard
              label="Reviews Given"
              value={reviewCount ?? 0}
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
            />
            <div className="bg-white rounded-2xl border border-[#e6e2dd] px-5 py-5 shadow-sm">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                <span className="text-[11px] font-semibold uppercase tracking-widest">Favourite Shop</span>
              </div>
              <p className="text-sm font-bold text-[#2f2f2f] truncate">{topVendorName}</p>
            </div>
          </div>

          {/* Editable profile form */}
          <ProfileForm
            defaultName={displayName}
            defaultPhone={phone}
            email={user.email ?? ""}
          />

        </div>
      </main>
      <Footer />
    </>
  );
}