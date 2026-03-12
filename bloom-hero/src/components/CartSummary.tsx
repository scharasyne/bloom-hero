import { CartItem } from "@/typess";

type CartSummaryProps = {
  cartItems: CartItem[];
  onCheckout: () => void;
  loading?: boolean;
  total?: number;
};

export default function CartSummary({ cartItems, onCheckout }: CartSummaryProps) {
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const deliveryFee = 40;
  const total = subtotal + deliveryFee;

  return (
    <>
      {/* Totals */}
      <div className="px-[28px] py-[16px] flex flex-col gap-[8px]">
        <div className="flex justify-between text-[13px] text-[#7a7a7a]">
          <span>Subtotal</span>
          <span>₱ {subtotal}</span>
        </div>
        <div className="flex justify-between text-[13px] text-[#7a7a7a]">
          <span>Delivery Fee</span>
          <span>₱ {deliveryFee}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-[#d4cfc9] w-full" />

      <div className="px-[28px] py-[16px] flex justify-between font-bold text-[16px] text-[#3f6f52]">
        <span>TOTAL</span>
        <span>₱ {total}</span>
      </div>

      <div className="border-t border-dashed border-[#d4cfc9] w-full" />

      {/* Checkout button */}
      <div className="px-[28px] py-[24px]">
        <button
          onClick={onCheckout}
          className="w-full bg-[#d24b46] flex items-center justify-center h-[44px] rounded-[999px] cursor-pointer"
        >
          <span className="font-semibold text-[15px] text-white tracking-[-0.075px]">
            Check Out
          </span>
        </button>
      </div>

      {/* Receipt footer */}
      <div className="flex flex-col items-center pb-[24px] gap-[4px]">
        <p className="text-[11px] text-[#ccc] tracking-[1px]">— thank you for your order —</p>
        <p className="text-[11px] text-[#ccc]">bloomhero.com</p>
      </div>
    </>
  );
}
