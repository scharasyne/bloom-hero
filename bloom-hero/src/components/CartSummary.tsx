import { ShoppingCart } from "lucide-react";
import { CartItem } from "@/typess";

type CartSummaryProps = {
  cartItems: CartItem[];
  onCheckout: () => void;
  loading?: boolean;
  total?: number;
};

export default function CartSummary({ cartItems, onCheckout }: CartSummaryProps) {
  const isEmpty = cartItems.length === 0;
  const availableItems = cartItems.filter(item => item.status !== "out-of-stock");
  const subtotal = availableItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const deliveryFee = availableItems.length === 0 ? 0 : 40;
  const total = subtotal + deliveryFee;

  return (
    <div
      className="bg-white rounded-xl border border-[#e8e8e8] overflow-hidden"
      style={{ fontFamily: "'Quicksand', sans-serif" }}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#f0f0f0]">
        <h2 className="text-sm font-bold text-[#2D2926] uppercase tracking-wide">Order Summary</h2>
      </div>

      {/* Line Items */}
      <div className="px-5 py-4 flex flex-col gap-3">
        <div className="flex justify-between text-sm text-[#6D6863]">
          <span>Subtotal ({availableItems.length} {availableItems.length === 1 ? "item" : "items"})</span>
          <span className="font-semibold text-[#2D2926]">₱{subtotal.toFixed(2)}</span>
        </div>

        {/* Delivery fee hidden when cart is empty */}
        {!isEmpty && (
          <div className="flex justify-between text-sm text-[#6D6863]">
            <span>Delivery Fee</span>
            <span className="font-semibold text-[#2D2926]">₱{deliveryFee.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="border-t border-[#f0f0f0] px-5 py-4 flex justify-between items-center">
        <span className="text-sm font-bold text-[#2D2926]">Total</span>
        <span className="text-lg font-bold text-[#D24B46]">₱{total.toFixed(2)}</span>
      </div>

      {/* Checkout Button */}
      <div className="px-5 pb-5">
        <button
          onClick={onCheckout}
          disabled={isEmpty}
          className="w-full h-11 rounded-full bg-[#D24B46] font-bold text-sm text-white shadow-sm shadow-[#D24B46]/20 transition-all hover:bg-[#A53A35] active:scale-95 disabled:bg-[#e8e8e8] disabled:text-[#A39E96] disabled:cursor-not-allowed disabled:shadow-none"
        >
          {isEmpty ? (
            <span className="flex items-center justify-center gap-2">
              <ShoppingCart size={15} strokeWidth={2} />
              Check Out (0)
            </span>
          ) : (
            `Check Out (${cartItems.length})`
          )}
        </button>
      </div>

      {/* Footer note */}
      <div className="flex flex-col items-center pb-4 gap-0.5">
        <p className="text-[10px] text-[#ccc] tracking-widest">— thank you for your order —</p>
        <p className="text-[10px] text-[#ccc]">bloomhero.com</p>
      </div>
    </div>
  );
}
