import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSession } from "@/features/auth/queries/getSession";
import { PublicVendorPageView } from "@/features/vendors/components/PublicVendorPageView";
import { guardPublicVendorPageAccess } from "@/features/vendors/queries/guardPublicVendorPageAccess";
import { getPublicVendorPageData } from "@/features/vendors/queries/getPublicVendorPageData";
import { canViewPublicVendorProfiles } from "@/features/vendors/utils/publicVendorAccess";

export const metadata: Metadata = {
  title: "Vendor",
  description: "Browse vendor bouquets, gallery, and pop-up schedule.",
};

type PublicVendorRoutePageProps = {
  params: Promise<{ vendorId: string }>;
};

export default async function PublicVendorRoutePage({ params }: PublicVendorRoutePageProps) {
  const { vendorId } = await params;
  await guardPublicVendorPageAccess(vendorId);
  const session = await getSession();
  const canRequestLocation = canViewPublicVendorProfiles(
    session.profile?.role as "admin" | "vendor" | "customer" | undefined
  );
  const data = await getPublicVendorPageData(vendorId);

  if (!data) {
    redirect("/search?scope=vendors");
  }

  return <PublicVendorPageView data={data} canRequestLocation={canRequestLocation} />;
}
