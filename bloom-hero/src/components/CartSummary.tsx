import { CartItem } from "@/typess";

type CartSummaryProps = {
  cartItems: CartItem[];
  selectedIds: Set<string>;
  onCheckout: () => void;
  loading?: boolean;
  checkoutLoading?: boolean;
  total?: number;
};

export default function CartSummary({ cartItems, selectedIds, onCheckout, checkoutLoading }: CartSummaryProps) {
  const selectedItems = cartItems.filter(item => selectedIds.has(item.id));
  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const deliveryFee = selectedItems.length > 0 ? 40 : 0;
  const total = subtotal + deliveryFee;

  return (
    <div
      className="bg-white rounded-[8px] border border-[#e8e8e8] overflow-hidden"
      style={{ fontFamily: "'Quicksand', sans-serif" }}
    >
      <div className="px-[20px] py-[16px] border-b border-[#f0f0f0]">
        <h2 className="text-[16px] font-bold text-[#333]">Order Summary</h2>
      </div>

      <div className="px-[20px] py-[16px] flex flex-col gap-[12px]">
        <div className="flex justify-between text-[13px] text-[#888]">
          <span>Subtotal ({selectedItems.length} selected)</span>
          <span className="text-[#333]">₱{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[13px] text-[#888]">
          <span>Delivery Fee</span>
          <span className="text-[#333]">₱{deliveryFee.toFixed(2)}</span>
        </div>
      </div>

      <div className="border-t border-[#f0f0f0]" />

      <div className="px-[20px] py-[16px] flex justify-between items-center">
        <span className="text-[14px] font-bold text-[#333]">Total</span>
        <span className="text-[20px] font-bold text-[#D96A63]">₱{total.toFixed(2)}</span>
      </div>

      <div className="px-[20px] pb-[20px]">
        <button
          onClick={onCheckout}
          disabled={selectedItems.length === 0 || checkoutLoading}
          className="w-full bg-[#D96A63] hover:bg-[#c45e58] disabled:bg-[#ddd] disabled:cursor-not-allowed transition-colors h-[44px] rounded-[4px] cursor-pointer"
        >
          <span className="font-semibold text-[14px] text-white tracking-[0.5px]">
            {checkoutLoading ? "Processing..." : `Check Out (${selectedItems.length})`}
          </span>
        </button>
      </div>

      <div className="flex flex-col items-center pb-[16px] gap-[2px]">
        <p className="text-[11px] text-[#ccc] tracking-[1px]">— thank you for your order —</p>
        <p className="text-[11px] text-[#ccc]">bloomhero.com</p>
      </div>
    </div>
  );
}
