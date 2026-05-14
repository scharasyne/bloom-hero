// Source: `src/app/(customer)/profile/page.tsx`

import Footer from "@/components/footer";
import { ProfileForm } from "@/features/customers/components/ProfileForm";
import { LinkedVendorCredentialsBox } from "@/features/customers/components/LinkedVendorCredentialsBox";
import type { CustomerProfilePageResult } from "@/features/customers/types";

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

export function CustomerProfileSignInView() {
  return (
    <>
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

type CustomerProfilePageViewProps = {
  profile: Extract<CustomerProfilePageResult, { authenticated: true }>;
};

export function CustomerProfilePageView({ profile }: CustomerProfilePageViewProps) {
  const formatPeso = (n: number) =>
    `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 0 })}`;

  return (
    <>
      <main className="min-h-screen bg-[#fbf7f4] px-4 sm:px-6 lg:px-8 pb-16">
        <div className="mx-auto w-full max-w-230 pt-8 space-y-6">
          <div className="bg-white rounded-2xl border border-[#e6e2dd] px-6 sm:px-8 py-8 relative overflow-hidden shadow-sm">
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#f8f5f0] pointer-events-none" />
            <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="h-16 w-16 rounded-full bg-[#eef6ee] border border-[#b8d9b8] flex items-center justify-center shrink-0">
                <span className="text-xl font-bold text-[#2f5d3a]">
                  {(profile.displayName || profile.email || "?").charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#2f2f2f] tracking-tight">
                  {profile.displayName || profile.email}
                </h1>
                <p className="text-sm text-gray-400 mt-0.5">Member since {profile.memberSince}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <StatCard
              label="Stems Ordered"
              value={profile.totalStems.toLocaleString("en-PH")}
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22V12M12 12C12 7 17 4 17 4M12 12C12 7 7 4 7 4"/></svg>}
            />
            <StatCard
              label="Total Spent"
              value={formatPeso(profile.totalSpent)}
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>}
            />
            <StatCard
              label="Completed Orders"
              value={profile.orderCount}
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>}
            />
            <StatCard
              label="Shops Visited"
              value={profile.uniqueVendorsCount}
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>}
            />
            <StatCard
              label="Reviews Given"
              value={profile.reviewCount}
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
            />
            <div className="bg-white rounded-2xl border border-[#e6e2dd] px-5 py-5 shadow-sm">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                <span className="text-[11px] font-semibold uppercase tracking-widest">Favourite Shop</span>
              </div>
              <p className="text-sm font-bold text-[#2f2f2f] truncate">{profile.topVendorName}</p>
            </div>
          </div>

          <ProfileForm
            defaultName={profile.displayName}
            defaultPhone={profile.phone}
            email={profile.email}
          />

          {profile.shouldShowLinkedVendorCredentials && profile.linkedVendorCredentials && (
            <LinkedVendorCredentialsBox
              credentials={{
                email: profile.linkedVendorCredentials.email,
                password: profile.linkedVendorCredentials.password,
                issuedAt: profile.linkedVendorCredentials.issued_at,
              }}
            />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
