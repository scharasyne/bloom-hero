import { getCustomerOrdersPage } from "@/features/orders/queries/getCustomerOrdersPage";
import {
  CustomerOrdersPageView,
  CustomerOrdersSignInView,
} from "@/features/orders/components/CustomerOrdersPageView";

export default async function CustomerOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const data = await getCustomerOrdersPage(tab);

  if (!data.authenticated) {
    return <CustomerOrdersSignInView />;
  }

  return <CustomerOrdersPageView activeTab={data.activeTab} orders={data.orders} />;
}
