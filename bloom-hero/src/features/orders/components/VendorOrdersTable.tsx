// Source: `src/app/(vendor)/_components/VendorOrdersTable.tsx`

import {
  vendorConfirmPayment,
  vendorMarkAsShipped,
} from "@/app/actions/order-status";
import { getVendorOrdersPage } from "@/features/orders/queries/getVendorOrdersPage";

type VendorOrdersTableProps = {
  successMessage?: string;
  errorMessage?: string;
  statusFilter?: "to_pay" | "to_ship" | "to_receive" | "all";
};

export default async function VendorOrdersTable({
  successMessage,
  errorMessage,
  statusFilter = "all",
}: VendorOrdersTableProps) {
  const result = await getVendorOrdersPage(statusFilter);

  if (!result.authenticated) {
    return (
      <div className="rounded-xl border border-red-100 bg-white p-6 text-sm text-red-600">
        Please sign in as a vendor to view orders.
      </div>
    );
  }

  if (!result.vendorFound) {
    return (
      <div className="rounded-xl border border-amber-200 bg-white p-6 text-sm text-amber-700">
        Vendor profile not found for this dashboard.
      </div>
    );
  }

  const { orders, customerNames } = result;

  return (
    <div className="space-y-4">
      {successMessage ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {successMessage}
        </p>
      ) : null}
      {errorMessage ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {errorMessage}
        </p>
      ) : null}

      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#d8d5d0] bg-white px-6 py-8 text-sm text-gray-500">
          No active orders yet.
        </div>
      ) : (
        orders.map((order) => {
          const statusLabel =
            order.status === "to_pay"
              ? "To Pay"
              : order.status === "to_ship"
                ? "To Ship"
                : "To Receive";

          return (
            <section
              key={order.id}
              className="rounded-2xl border border-[#e4ded7] bg-white px-6 py-5 shadow-sm"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#2f2f2f]">
                    Order #{order.id.slice(0, 8)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Customer: {customerNames[order.customerId] ?? "Customer"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.orderDate).toLocaleString()}
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full border border-[#dad5cc] bg-[#f7f4ef] px-3 py-1 text-xs font-semibold text-[#5f5a55]">
                  {statusLabel}
                </span>
              </div>

              <div className="space-y-2 border-y border-[#f1ece5] py-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-4 text-sm">
                    <p className="text-[#333]">{item.productName}</p>
                    <p className="text-gray-500">
                      {item.quantity}x • ₱{item.subtotal.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-gray-600">
                    Payment: {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online"}
                  </p>
                  <p className="text-sm font-semibold text-[#2f5d3a]">
                    Total: ₱{order.totalAmount.toFixed(2)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {order.status === "to_pay" && order.paymentMethod === "online" ? (
                    <>
                      {order.receiptSignedUrl ? (
                        <a
                          href={order.receiptSignedUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full border border-[#dad5cc] px-3 py-1.5 text-xs font-semibold text-[#5f5a55]"
                        >
                          View Receipt
                        </a>
                      ) : (
                        <span className="rounded-full border border-[#f3d8d8] bg-[#fff8f8] px-3 py-1.5 text-xs text-[#cc6d6d]">
                          Waiting for receipt
                        </span>
                      )}

                      <form action={vendorConfirmPayment}>
                        <input type="hidden" name="orderId" value={order.id} />
                        <button
                          type="submit"
                          disabled={!order.receiptSignedUrl}
                          className="rounded-full border border-[#2f5d3a] bg-[#2f5d3a] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#25492e] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Confirm Payment
                        </button>
                      </form>
                    </>
                  ) : null}

                  {order.status === "to_ship" ? (
                    <form action={vendorMarkAsShipped}>
                      <input type="hidden" name="orderId" value={order.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-[#2f5d3a] bg-[#2f5d3a] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#25492e]"
                      >
                        Mark as Shipped
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
