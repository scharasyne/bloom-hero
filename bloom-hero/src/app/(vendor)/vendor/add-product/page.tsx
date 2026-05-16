import { redirect } from "next/navigation";

import VendorAddProductPage from "@/features/products/components/AddProduct";
import { getVendorCommonProfileByOwner } from "@/features/vendors/queries/getVendorCommonProfile";
import { canManageCatalog } from "@/features/vendors/utils/catalogAccess";

export default async function VendorAddProductRoutePage() {
  const commonProfile = await getVendorCommonProfileByOwner();
  if (!commonProfile) redirect("/login");
  if (!canManageCatalog(commonProfile.businessType)) redirect("/vendor/products");

  return <VendorAddProductPage />;
}
