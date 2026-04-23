import { redirect } from "next/navigation";
import type { Metadata } from "next";
import CustomerVendorProfile from "@/app/(customer)/_components/CustomerVendorProfile";
import {
  getVendorProfile,
  getVendorProducts,
} from "@/app/(customer)/_components/vendor-actions";

export const metadata: Metadata = {
  title: "Vendor | Market",
  description: "Browse vendor bouquets and details.",
};

interface MarketVendorPageProps {
  params: Promise<{
    vendorId: string;
  }>;
}

export default async function MarketVendorPage({
  params,
}: MarketVendorPageProps) {
  const { vendorId } = await params;

  const [vendor, products] = await Promise.all([
    getVendorProfile(vendorId),
    getVendorProducts(vendorId),
  ]);

  if (!vendor) {
    redirect("/customer/dashboard");
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
