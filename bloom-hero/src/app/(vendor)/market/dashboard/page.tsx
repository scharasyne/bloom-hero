// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
// import { VendorDashboardSidebarCard } from "@/app/(vendor)/_components/vendor-dashboard-sidebar-card";
// import { AlertCircle } from "lucide-react";

// type VendorStatus = "pending" | "approved" | "rejected";

// export default function VendorMarketDashboardPage() {
//   const [status, setStatus] = useState<VendorStatus | null>(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();
//   const supabase = createSupabaseBrowserClient();

//   useEffect(() => {
//     async function fetchVendorStatus() {
//       try {
//         const {
//           data: { user },
//         } = await supabase.auth.getUser();

//         if (!user) {
//           router.push("/login");
//           return;
//         }

//         const { data: vendorData, error } = await supabase
//           .from("vendors")
//           .select("status")
//           .eq("owner_id", user.id)
//           .single();

//         if (error || !vendorData) {
//           console.error("Error fetching vendor status:", error);
//           setStatus(null);
//         } else if (vendorData.status === "rejected") {
//           router.push("/customer/dashboard");
//         } else {
//           setStatus(vendorData.status);
//         }
//       } catch (err) {
//         console.error("Unexpected error:", err);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchVendorStatus();
//   }, [supabase, router]);

//   if (loading) {
//     return (
//       <main className="flex">
//         <div className="lg:p-6">
//           <VendorDashboardSidebarCard activeTab="dashboard" vendorType="market" />
//         </div>
//         <div className="w-full p-4 lg:pl-2 lg:pr-10 md:p-6 sm:pt-20">
//           <p className="text-sm text-muted-foreground">Loading...</p>
//         </div>
//       </main>
//     );
//   }

//   return (
//     <main className="flex">
//       <div className="lg:p-6">
//         <VendorDashboardSidebarCard activeTab="dashboard" vendorType="market" />
//       </div>

//       <div className="w-full p-4 lg:pl-2 lg:pr-10 md:p-6 sm:pt-20">
//         <div>
//           <div className="mb-8">
//             <h1 className="text-2xl font-semibold">Dashboard</h1>
//             <p className="text-muted-foreground text-sm">
//               Here's what's happening with your shop.
//             </p>
//           </div>

//           {status === "pending" && (
//             <div className="flex gap-3 items-start p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
//               <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />
//               <div>
//                 <h3 className="text-sm font-semibold text-yellow-900">
//                   Application Pending
//                 </h3>
//                 <p className="text-sm text-yellow-700 mt-0.5 leading-relaxed">
//                   Your vendor application is currently under review. Some
//                   features will be unavailable until your application is
//                   approved.
//                 </p>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </main>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { VendorDashboardSidebarCard } from "@/app/(vendor)/_components/vendor-dashboard-sidebar-card";
import { VendorMarketDashboardContent } from "@/app/(vendor)/_components/VendorMarketDashboardContent";

type VendorStatus = "pending" | "approved" | "rejected";

export default function VendorMarketDashboardPage() {
  const [status, setStatus] = useState<VendorStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    async function fetchVendorStatus() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        const { data: vendorData, error } = await supabase
          .from("vendors")
          .select("status")
          .eq("owner_id", user.id)
          .single();

        if (error || !vendorData) {
          console.error("Error fetching vendor status:", error);
          setStatus(null);
        } else if (vendorData.status === "rejected") {
          router.push("/customer/dashboard");
        } else {
          setStatus(vendorData.status as VendorStatus);
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
      <div
        className="flex h-screen bg-[#fbf7f4] text-[#1f1f1f]"
        style={{ fontFamily: "'Quicksand', sans-serif" }}
      >
        <VendorDashboardSidebarCard activeTab="dashboard" vendorType="market" />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[#7a7a7a]">Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div
      className="flex h-screen bg-[#fbf7f4] text-[#1f1f1f]"
      style={{ fontFamily: "'Quicksand', sans-serif" }}
    >
      {/* Sidebar */}
      <VendorDashboardSidebarCard activeTab="dashboard" vendorType="market" />

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">

            {/* Pending banner */}
            {status === "pending" && (
              <div className="flex gap-4 items-start p-4 mb-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-900 mb-1">Application Pending</h3>
                  <p className="text-sm text-yellow-800">
                    Your vendor application is currently under review. Some features will be unavailable until your application is approved.
                  </p>
                </div>
              </div>
            )}

            {/* Page heading */}
            <div className="mb-8">
              <h1 className="text-[28px] font-bold text-[#1f1f1f] tracking-[-0.64px]">Dashboard</h1>
              <p className="text-[#6f6a65] mt-1 text-[15px] font-medium">
                Here's what's happening with your shop.
              </p>
            </div>

            {/* Dashboard widgets — only shown when approved */}
            {status === "approved" && <VendorMarketDashboardContent />}
          </div>
        </div>
      </main>
    </div>
  );
}