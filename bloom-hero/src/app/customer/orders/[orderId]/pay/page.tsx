import { uploadOrderReceiptProof } from "@/app/actions/order-status";

type PayPageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function CustomerPayOrderPage({ params }: PayPageProps) {
  const { orderId } = await params;

  async function submitReceipt(formData: FormData) {
    "use server";
    formData.set("orderId", orderId);
    await uploadOrderReceiptProof(formData);
  }

  return (
    <main className="mx-auto w-full max-w-xl px-6 py-10">
      <h1 className="text-2xl font-bold text-[#2f2f2f]">Pay Order</h1>
      <p className="mt-2 text-sm text-[#5a5a5a]">
        Upload your payment receipt to continue processing this order.
      </p>

      <form action={submitReceipt} encType="multipart/form-data" className="mt-6 space-y-4 rounded-2xl border border-[#e2ddd4] bg-white p-6">
        <input
          type="file"
          name="receipt"
          accept="image/jpeg,image/png"
          required
          className="block w-full rounded-md border border-[#ddd] p-2 text-sm"
        />
        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-full bg-[#2f5d3a] px-5 py-2 text-sm font-semibold text-white hover:bg-[#26492f]"
          >
            Submit Receipt
          </button>
          <a
            href="/orders?tab=to-pay"
            className="rounded-full border border-[#d9d9d9] px-5 py-2 text-sm font-semibold text-[#4f4f4f]"
          >
            Back
          </a>
        </div>
      </form>
    </main>
  );
}
