import { requireCustomerSettingsPage } from "@/features/customers/queries/getCustomerSettingsPage";
import { CustomerSettingsPageView } from "@/features/customers/components/CustomerSettingsPageView";

export default async function CustomerSettingsPage() {
  const data = await requireCustomerSettingsPage();

  return <CustomerSettingsPageView {...data} />;
}
