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
      <main className="flex">
        <div className="lg:p-6">
          <VendorDashboardSidebarCard activeTab="dashboard" vendorType="market" />
        </div>
        <div className="w-full p-4 lg:pl-2 lg:pr-10 md:p-6 sm:pt-20">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex">
      <div className="lg:p-6">
        <VendorDashboardSidebarCard activeTab="dashboard" vendorType="market" />
      </div>

      <div className="w-full p-4 lg:pl-2 lg:pr-10 md:p-6 sm:pt-20">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Here's what's happening with your shop.
          </p>
        </div>

        {/* Pending banner */}
        {status === "pending" && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-500" />
            <div>
              <h3 className="text-sm font-semibold text-yellow-900">Application Pending</h3>
              <p className="mt-0.5 text-sm leading-relaxed text-yellow-700">
                Your vendor application is currently under review. Some features will be
                unavailable until your application is approved.
              </p>
            </div>
          </div>
        )}

        {/* Dashboard widgets — only shown when approved */}
        {status === "approved" && <VendorMarketDashboardContent />}
      </div>
    </main>
  );
}