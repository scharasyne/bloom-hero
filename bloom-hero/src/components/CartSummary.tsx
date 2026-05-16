import { CartItem } from "@/types";

type CartSummaryProps = {
  cartItems: CartItem[];
  selectedIds: Set<string>;
  onCheckout: (paymentMethod: "online" | "cod") => void;
  paymentMethod: "online" | "cod";
  onPaymentMethodChange: (method: "online" | "cod") => void;
  checkoutLoading?: boolean;
  isCartEmpty?: boolean;
};

export default function CartSummary({
  cartItems,
  selectedIds,
  onCheckout,
  paymentMethod,
  onPaymentMethodChange,
  checkoutLoading,
  isCartEmpty = false,
}: CartSummaryProps) {
  const selectedItems = cartItems.filter((item) => selectedIds.has(item.id));
  const nothingSelected = selectedItems.length === 0;
  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const uniqueVendors = new Set(selectedItems.map((item) => item.vendorName));
  const deliveryFee = uniqueVendors.size > 0 ? uniqueVendors.size * 40 : 0;
  const total = subtotal + deliveryFee;

  return (
    <div
      className="overflow-hidden rounded-2xl border border-[#e8e4df] bg-white shadow-sm"
      style={{ fontFamily: "'Quicksand', sans-serif" }}
    >
      <div className="border-b border-[#f0ece8] px-5 py-5 sm:px-6 sm:py-6">
        <h2 className="text-sm font-bold uppercase tracking-wide text-[#2D2926] sm:text-base">
          Order Summary
        </h2>
        {isCartEmpty && (
          <p className="mt-2 text-sm leading-relaxed text-[#A39E96]">
            Add items to your cart to see totals and check out.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4 px-5 py-5 sm:gap-5 sm:px-6 sm:py-6">
        <div className="flex justify-between gap-4 text-sm text-[#6D6863]">
          <span>Subtotal ({selectedItems.length} selected)</span>
          <span className="shrink-0 font-semibold text-[#2D2926]">&#8369;{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-4 text-sm text-[#6D6863]">
          <span>Delivery Fee</span>
          <span className="shrink-0 font-semibold text-[#2D2926]">&#8369;{deliveryFee.toFixed(2)}</span>
        </div>

        <div className="space-y-3 pt-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6D6863] sm:text-sm">
            Payment Method
          </p>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
            <button
              type="button"
              onClick={() => onPaymentMethodChange("online")}
              className={`rounded-xl border px-4 py-3.5 text-sm font-semibold transition-colors ${
                paymentMethod === "online"
                  ? "border-[#D24B46] bg-[#fff3f2] text-[#D24B46]"
                  : "border-[#e8e4df] bg-white text-[#6D6863] hover:bg-[#faf8f6]"
              }`}
            >
              Online
            </button>
            <button
              type="button"
              onClick={() => onPaymentMethodChange("cod")}
              className={`rounded-xl border px-4 py-3.5 text-sm font-semibold transition-colors ${
                paymentMethod === "cod"
                  ? "border-[#D24B46] bg-[#fff3f2] text-[#D24B46]"
                  : "border-[#e8e4df] bg-white text-[#6D6863] hover:bg-[#faf8f6]"
              }`}
            >
              Cash on Delivery
            </button>
          </div>
          <p className="text-xs leading-relaxed text-[#A39E96] sm:text-sm">
            {paymentMethod === "online"
              ? "Online orders go to To Pay and require receipt upload."
              : "COD orders skip To Pay and go straight to To Ship."}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-[#f0ece8] px-5 py-5 sm:px-6">
        <span className="text-base font-bold text-[#2D2926]">Total</span>
        <span className="text-xl font-bold text-[#D24B46] sm:text-2xl">&#8369;{total.toFixed(2)}</span>
      </div>

      <div className="px-5 pb-5 sm:px-6 sm:pb-6">
        <button
          type="button"
          onClick={() => onCheckout(paymentMethod)}
          disabled={nothingSelected || checkoutLoading || isCartEmpty}
          className="flex h-12 w-full items-center justify-center rounded-xl bg-[#D24B46] text-sm font-semibold text-white transition-colors hover:bg-[#A53A35] disabled:cursor-not-allowed disabled:bg-[#ddd] disabled:text-[#999] sm:h-14 sm:text-base"
        >
          {checkoutLoading ? "Processing..." : `Check Out (${selectedItems.length})`}
        </button>
      </div>

      <div className="flex flex-col items-center gap-1 px-5 pb-6 text-center">
        <p className="text-[11px] tracking-widest text-[#d4cdc6]">thank you for your order</p>
        <p className="text-[11px] text-[#d4cdc6]">bloomhero.com</p>
      </div>
    </div>
  );
}
