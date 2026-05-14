// Source: `src/app/(customer)/orders/[orderId]/confirm-receipt/page.tsx`

type CustomerConfirmReceiptPageViewProps = {
  submitConfirmReceipt: (formData: FormData) => Promise<void>;
};

export function CustomerConfirmReceiptPageView({
  submitConfirmReceipt,
}: CustomerConfirmReceiptPageViewProps) {
  return (
    <main className="mx-auto w-full max-w-xl px-6 py-10">
      <h1 className="text-2xl font-bold text-[#2f2f2f]">Confirm Receipt</h1>
      <p className="mt-2 text-sm text-[#5a5a5a]">
        Confirming receipt will complete this order and unlock your review.
      </p>

      <form action={submitConfirmReceipt} className="mt-6 space-y-4 rounded-2xl border border-[#dbe8e0] bg-white p-6">
        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-full bg-[#2f5d3a] px-5 py-2 text-sm font-semibold text-white hover:bg-[#26492f]"
          >
            Confirm Received
          </button>
          <a
            href="/orders?tab=to-receive"
            className="rounded-full border border-[#d9d9d9] px-5 py-2 text-sm font-semibold text-[#4f4f4f]"
          >
            Back
          </a>
        </div>
      </form>
    </main>
  );
}
