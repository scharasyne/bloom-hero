import { cancelCustomerOrder } from "@/app/actions/order-status";

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

  return (
    <main className="mx-auto w-full max-w-xl px-6 py-10">
      <h1 className="text-2xl font-bold text-[#2f2f2f]">Cancel Order</h1>
      <p className="mt-2 text-sm text-[#5a5a5a]">
        This action cannot be undone. Are you sure you want to cancel this order?
      </p>

      <form action={submitCancel} className="mt-6 space-y-4 rounded-2xl border border-[#f1d3d1] bg-[#fff8f7] p-6">
        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-full bg-[#d24b46] px-5 py-2 text-sm font-semibold text-white hover:bg-[#bb3f3a]"
          >
            Confirm Cancel
          </button>
          <a
            href="/orders?tab=to-pay"
            className="rounded-full border border-[#d9d9d9] px-5 py-2 text-sm font-semibold text-[#4f4f4f]"
          >
            Keep Order
          </a>
        </div>
      </form>
    </main>
  );
}
