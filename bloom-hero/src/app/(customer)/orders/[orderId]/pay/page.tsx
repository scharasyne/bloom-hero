import { loadCustomerPayPage } from "@/features/orders/queries/loadCustomerPayPage";
import { uploadOrderReceiptProof } from "@/features/orders/actions/uploadOrderReceiptProof";
import {
  CustomerPayOrderNotFoundView,
  CustomerPayOrderPageView,
  CustomerPayOrderUnauthenticatedView,
} from "@/features/orders/components/CustomerPayOrderPageView";

type CustomerPayOrderPageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function CustomerPayOrderPage({ params }: CustomerPayOrderPageProps) {
  const { orderId } = await params;
  const paymentPage = await loadCustomerPayPage(orderId);

  if (paymentPage.status === "unauthenticated") {
    return <CustomerPayOrderUnauthenticatedView />;
  }

  if (paymentPage.status === "not-found") {
    return <CustomerPayOrderNotFoundView />;
  }

  async function submitReceipt(formData: FormData) {
    "use server";
    formData.set("orderId", orderId);
    await uploadOrderReceiptProof(formData);
  }

  return (
    <CustomerPayOrderPageView
      orderId={orderId}
      paymentPage={paymentPage}
      submitReceipt={submitReceipt}
    />
  );
}
