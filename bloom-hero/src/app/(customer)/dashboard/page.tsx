import { requireCustomerDashboardPage } from "@/features/customers/queries/getCustomerDashboardPage";
import { CustomerDashboardPageView } from "@/features/customers/components/CustomerDashboardPageView";

export default async function CustomerDashboardPage() {
  const data = await requireCustomerDashboardPage();

  return <CustomerDashboardPageView welcomeName={data.welcomeName} />;
}
