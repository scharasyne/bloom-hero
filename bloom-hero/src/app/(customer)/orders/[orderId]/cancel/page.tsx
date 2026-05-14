import { cancelCustomerOrder } from "@/features/orders/actions/cancelCustomerOrder";
import { CustomerCancelOrderPageView } from "@/features/orders/components/CustomerCancelOrderPageView";

type CancelPageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function CustomerCancelOrderPage({ params }: CancelPageProps) {
  const { orderId } = await params;

  async function submitCancel(formData: FormData) {
    "use server";
    formData.set("orderId", orderId);
    await cancelCustomerOrder(formData);
  }

  return <CustomerCancelOrderPageView submitCancel={submitCancel} />;
}
