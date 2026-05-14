import { requireCustomerVendorApplicationPage } from "@/features/vendors/queries/getCustomerVendorApplicationPage";
import { CustomerVendorApplicationPageView } from "@/features/vendors/components/CustomerVendorApplicationPageView";

export default async function VendorApplicationPage() {
  const data = await requireCustomerVendorApplicationPage();

  return <CustomerVendorApplicationPageView {...data} />;
}
