import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { PublicVendorPageView } from "@/features/vendors/components/PublicVendorPageView";
import { getPublicVendorPageData } from "@/features/vendors/queries/getPublicVendorPageData";

export const metadata: Metadata = {
  title: "Vendor",
  description: "Browse vendor bouquets, gallery, and pop-up schedule.",
};

type PublicVendorRoutePageProps = {
  params: Promise<{ vendorId: string }>;
};

export default async function PublicVendorRoutePage({ params }: PublicVendorRoutePageProps) {
  const { vendorId } = await params;
  const data = await getPublicVendorPageData(vendorId);

  if (!data) {
    redirect("/search?scope=vendors");
  }

  return <PublicVendorPageView data={data} />;
}
