import { uploadOrderReceiptProof } from "@/app/actions/order-status";

type CustomerPayOrderPageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function CustomerPayOrderPage({
  params,
}: CustomerPayOrderPageProps) {
  const { orderId } = await params;

  async function submitReceipt(formData: FormData) {
    "use server";
    formData.set("orderId", orderId);
    await uploadOrderReceiptProof(formData);
  }

  return (
    <main className="mx-auto w-full max-w-xl px-6 py-10">
      <h1 className="text-2xl font-bold text-[#2f2f2f]">Upload Payment Receipt</h1>
      <p className="mt-2 text-sm text-[#5a5a5a]">
        Upload a clear JPEG or PNG receipt to continue your order.
      </p>

      <form
        action={submitReceipt}
        className="mt-6 space-y-4 rounded-2xl border border-[#f1d3d1] bg-[#fff8f7] p-6"
      >
        <input type="hidden" name="orderId" value={orderId} />

        <label className="block text-sm font-semibold text-[#2f2f2f]" htmlFor="receipt">
          Receipt Image
        </label>
        <input
          id="receipt"
          name="receipt"
          type="file"
          accept="image/png,image/jpeg"
          required
          className="block w-full rounded-lg border border-[#d9d9d9] bg-white px-3 py-2 text-sm"
        />

        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-full bg-[#d24b46] px-5 py-2 text-sm font-semibold text-white hover:bg-[#bb3f3a]"
          >
            Submit Receipt
          </button>
          <a
            href="/orders?tab=to-pay"
            className="rounded-full border border-[#d9d9d9] px-5 py-2 text-sm font-semibold text-[#4f4f4f]"
          >
            Back to Orders
          </a>
        </div>
      </form>
    </main>
  );
}
