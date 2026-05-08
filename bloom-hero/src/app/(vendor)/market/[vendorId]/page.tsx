import { redirect } from "next/navigation";
import type { Metadata } from "next";
import CustomerVendorProfile from "@/app/(vendor)/_components/CustomerVendorProfile";
import { getVendorProducts, getVendorProfile } from "@/lib/vendors/vendor-actions";

export const metadata: Metadata = {
  title: "Market Vendor",
  description: "Browse market vendor bouquets and profile.",
};

interface MarketVendorPageProps {
  params: Promise<{
    vendorId: string;
  }>;
}

export default async function MarketVendorPage({ params }: MarketVendorPageProps) {
  const { vendorId } = await params;
  const [vendor, products] = await Promise.all([
    getVendorProfile(vendorId),
    getVendorProducts(vendorId),
  ]);

  if (!vendor) {
    // redirect("/customer/dashboard");
    redirect("/search?scope=vendors");
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <CustomerVendorProfile
        vendorId={vendor.id}
        vendor={vendor}
        products={products}
        vendorType="market"
      />
    </main>
  );
}
