"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { VendorDashboardSidebarCard } from "@/app/vendor/_components/vendor-dashboard-sidebar-card";
import { AlertCircle } from "lucide-react";

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
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="text-center text-gray-500">Loading...</div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="grid gap-6 md:grid-cols-[220px_1fr] md:items-start">
        <VendorDashboardSidebarCard activeTab="dashboard" vendorType="pop-up" />

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

          <div className="mb-8 flex flex-col justify-between">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="text-muted-foreground text-sm">
              Here's what's happening with your shop.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}