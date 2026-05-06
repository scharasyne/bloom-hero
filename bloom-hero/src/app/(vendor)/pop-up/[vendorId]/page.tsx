import { redirect } from "next/navigation";
import type { Metadata } from "next";
import CustomerVendorProfile from "../../_components/CustomerVendorProfile";
import CustomerVendorSchedulePanel from "../../_components/CustomerVendorSchedulePanel";
import {
  getVendorProfile,
  getVendorProducts,
  getPopUpSchedule,
} from "@/lib/vendors/vendor-actions";

export const metadata: Metadata = {
  title: "Pop-up Vendor",
  description: "Browse pop-up vendor bouquets and schedule.",
};

interface PopUpVendorPageProps {
  params: Promise<{
    vendorId: string;
  }>;
}

export default async function PopUpVendorPage({
  params,
}: PopUpVendorPageProps) {
  const { vendorId } = await params;

  const [vendor, products, schedule] = await Promise.all([
    getVendorProfile(vendorId),
    getVendorProducts(vendorId),
    getPopUpSchedule(vendorId),
  ]);

  if (!vendor) {
    redirect("/customer/dashboard");
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CustomerVendorProfile
            vendorId={vendor.id}
            vendor={vendor}
            products={products}
            vendorType="pop-up"
          />
        </div>

        <aside className="lg:col-span-1">
          <CustomerVendorSchedulePanel
            schedule={schedule}
            vendorName={vendor.shop_name}
          />
        </aside>
      </div>
    </main>
  );
}