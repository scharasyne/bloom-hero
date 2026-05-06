"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { AlertCircle } from "lucide-react";
import { VendorDashboardSidebarCard } from "@/app/(vendor)/_components/vendor-dashboard-sidebar-card";
import { VendorDashboardContent } from "@/app/(vendor)/_components/VendorMarketDashboardContent";


type VendorStatus = "pending" | "approved" | "rejected";

export default function VendorPopUpDashboardPage() {
  const [status, setStatus] = useState<VendorStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    async function fetchVendorStatus() {
      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        // Check if user is rejected
        const { data: vendorData, error } = await supabase
          .from("vendors")
          .select("status")
          .eq("owner_id", user.id)
          .single();

        if (error || !vendorData) {
          // Handle error appropriately
          console.error("Error fetching vendor status:", error);
          setStatus(null);
        } else if (vendorData.status === "rejected") {
          // Redirect rejected users to customer dashboard
          router.push("/customer/dashboard");
        } else {
          setStatus(vendorData.status);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchVendorStatus();
  }, [supabase, router]);

  if (loading) {
    return (
      <main className="flex min-h-screen bg-[#fbf7f4] text-[#1f1f1f]" style={{ fontFamily: "'Quicksand', sans-serif" }}>
        <div className="p-4 sm:p-6 lg:p-8">
          <VendorDashboardSidebarCard activeTab="dashboard" vendorType="pop-up" />
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4 sm:px-6 sm:pb-8 sm:pt-6 lg:px-8 lg:pb-10 lg:pt-8">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-[#fbf7f4] text-[#1f1f1f]" style={{ fontFamily: "'Quicksand', sans-serif" }}>
      <div className="p-4 sm:p-6 lg:p-8">
        <VendorDashboardSidebarCard activeTab="dashboard" vendorType="pop-up" />
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4 sm:px-6 sm:pb-8 sm:pt-6 lg:px-8 lg:pb-10 lg:pt-8">
        <div className="flex flex-col gap-6">
        {status === "pending" && (
          <div className="flex gap-4 items-start p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 mb-1">Application Pending</h3>
              <p className="text-sm text-yellow-800">
                Your vendor application is currently under review. Some features will be unavailable until your application is approved.
              </p>
            </div>
          </div>
        )}
        {status === "approved" && <VendorDashboardContent vendorType="pop-up" />}
        </div>
      </div>
    </main>
  );
};