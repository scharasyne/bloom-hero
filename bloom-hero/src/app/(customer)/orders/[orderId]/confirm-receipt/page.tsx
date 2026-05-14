import { markOrderReceived } from "@/features/orders/actions/markOrderReceived";
import { CustomerConfirmReceiptPageView } from "@/features/orders/components/CustomerConfirmReceiptPageView";

type ConfirmReceiptPageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function CustomerConfirmReceiptPage({ params }: ConfirmReceiptPageProps) {
  const { orderId } = await params;

  async function submitConfirmReceipt(formData: FormData) {
    "use server";
    formData.set("orderId", orderId);
    await markOrderReceived(formData);
  }

  return <CustomerConfirmReceiptPageView submitConfirmReceipt={submitConfirmReceipt} />;
}
