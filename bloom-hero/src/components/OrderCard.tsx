import React from "react";
import { Order } from "@/typess";
import { DeliveryTimeline } from "./DeliveryTimeline";
import { Icon } from "@iconify/react";


interface OrderCardProps {
  order: Order;
  variant: "to-pay" | "to-ship" | "to-receive" | "completed";
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, variant }) => {
  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      {variant === "to-pay" && (
        <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-6 mb-6 border border-[#e6e2dd]">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="font-semibold text-2xl text-[#2c2a28] tracking-[-0.14px] leading-[36px]">
                {order.vendorName}
              </p>
              <p className="text-base text-[#7a746e] tracking-[-0.08px] leading-[24px]">
                Order #{order.orderNumber} • Placed {order.datePlaced}
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f3f2f0] rounded-2xl border border-[#e6e2dd]">
              <div className="w-3 h-3 bg-[#2e7d5b] rounded-full" />
              <span className="font-medium text-base text-[#2c2a28]">To Pay</span>
            </div>
          </div>
      
          {/* Item Row */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border border-[#e6e2dd]">
              <img
                src={order.items[0]?.thumbnail}
                alt={order.items[0]?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-lg text-[#2c2a28]">{order.items[0]?.name}</p>
              <p className="text-sm text-[#7a746e]">{order.vendorName}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="font-medium text-base text-[#2c2a28]">₱{order.items[0]?.price}</p>
                <span className="px-2 py-0.5 bg-[#f3f2f0] rounded-lg border border-[#e6e2dd] text-sm font-medium">
                  × {order.items[0]?.qty}
                </span>
              </div>
            </div>
            <div className="text-right font-medium text-base text-[#2c2a28]">
              ₱{order.items[0]?.price * order.items[0]?.qty}
            </div>
          </div>
      
          {/* Price Breakdown */}
          <div className="border-t border-[#e6e2dd] my-4" />
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex justify-between">
              <span className="text-base text-[#7a746e]">Subtotal</span>
              <span className="font-medium text-base text-[#2c2a28]">₱{order.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-base text-[#7a746e]">Delivery</span>
              <span className="font-medium text-base text-[#2c2a28]">₱{order.deliveryFee}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-base text-[#7a746e]">Total</span>
              <span className="text-2xl font-semibold text-[#2e7d5b]">₱{order.total}</span>
            </div>
          </div>
      
          {/* Payment Due Warning */}
          {order.paymentDue && (
            <div className="flex gap-2 mb-4 p-3 bg-[#fff8f7] rounded-lg border border-[#f3d1cd]">
              <Icon icon="mdi:alert-circle-outline" className="text-[#d65245] text-xl flex-shrink-0" />
              <div>
                <p className="font-medium text-base text-[#d65245]">
                  Payment due by {order.paymentDue}
                </p>
                <p className="text-sm text-[#7a746e]">
                  Unpaid • Select a payment method to confirm your order.
                </p>
              </div>
            </div>
          )}
      
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="flex-1 px-4 py-2 bg-[#2e7d5b] rounded-2xl border border-[#e6e2dd] text-white font-medium text-sm">
              Proceed to Payment
            </button>
            <button className="flex-1 px-4 py-2 bg-white rounded-2xl border border-[#e6e2dd] text-[#2c2a28] font-medium text-sm">
              Change Payment Method
            </button>
            <button className="flex-1 px-4 py-2 bg-white rounded-2xl border border-[#e6e2dd] text-[#2c2a28] font-medium text-sm">
              Cancel Order
            </button>
          </div>
        </div>
      )}

      {variant === "to-ship" && (
        <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-6 mb-6 border border-[#e6e2dd]">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="font-semibold text-2xl text-[#2c2a28] tracking-[-0.14px] leading-[36px]">
                {order.vendorName}
              </p>
              <p className="text-base text-[#7a746e] tracking-[-0.08px] leading-[24px]">
                Order #{order.orderNumber} • Placed {order.datePlaced}
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f3f2f0] rounded-2xl border border-[#e6e2dd]">
              <div className="w-3 h-3 bg-[#2e7d5b] rounded-full" />
              <span className="font-medium text-base text-[#2c2a28]">To Ship</span>
            </div>
          </div>
      
          {/* Item List */}
          <div className="flex flex-col gap-4 mb-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border border-[#e6e2dd]">
                  <img
                    src={item.thumbnail}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-lg text-[#2c2a28]">{item.name}</p>
                  <p className="text-sm text-[#7a746e]">{order.vendorName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="font-medium text-base text-[#2c2a28]">₱{item.price}</p>
                    <span className="px-2 py-0.5 bg-[#f3f2f0] rounded-lg border border-[#e6e2dd] text-sm font-medium">
                      × {item.qty}
                    </span>
                  </div>
                </div>
                <div className="text-right font-medium text-base text-[#2c2a28]">
                  ₱{item.price * item.qty}
                </div>
              </div>
            ))}
          </div>
      
          {/* Price Breakdown */}
          <div className="border-t border-[#e6e2dd] my-4" />
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex justify-between">
              <span className="text-base text-[#7a746e]">Subtotal</span>
              <span className="font-medium text-base text-[#2c2a28]">₱{order.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-base text-[#7a746e]">Delivery</span>
              <span className="font-medium text-base text-[#2c2a28]">₱{order.deliveryFee}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-base text-[#7a746e]">✓ Total Paid</span>
              <span className="text-2xl font-semibold text-[#2e7d5b]">₱{order.total}</span>
            </div>
          </div>
      
          {/* Status Section */}
          <div className="mb-4 p-3 bg-[#f3f2f0] rounded-lg border border-[#e6e2dd]">
            <p className="font-medium text-base text-[#2c2a28]">Vendor is preparing your order</p>
            <p className="text-sm text-[#7a746e]">Estimated ship‑out {order.estimatedShipOut || "soon"}</p>
          </div>
      
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="flex-1 px-4 py-2 bg-white rounded-2xl border border-[#e6e2dd] text-[#2c2a28] font-medium text-sm">
              Contact Vendor
            </button>
            <button className="flex-1 px-4 py-2 bg-white rounded-2xl border border-[#e6e2dd] text-[#2c2a28] font-medium text-sm">
              View Details
            </button>
            <button className="flex-1 px-4 py-2 bg-white rounded-2xl border border-[#e6e2dd] text-[#2c2a28] font-medium text-sm">
              Cancel Order
            </button>
          </div>
        </div>
      )}


      {variant === "to-receive" && (
       <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-6 mb-6 border border-[#e6e2dd]">
         {/* Header */}
         <div className="flex justify-between items-start mb-4">
           <div>
             <p className="font-semibold text-2xl text-[#2c2a28] tracking-[-0.14px] leading-[36px]">
               {order.vendorName}
             </p>
             <p className="text-base text-[#7a746e] tracking-[-0.08px] leading-[24px]">
               Order #{order.orderNumber} • Placed {order.datePlaced}
             </p>
           </div>
           <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f3f2f0] rounded-2xl border border-[#e6e2dd]">
             <div className="w-3 h-3 bg-[#2e7d5b] rounded-full" />
             <span className="font-medium text-base text-[#2c2a28]">To Receive</span>
           </div>
         </div>
     
         {/* Item List */}
         <div className="flex flex-col gap-4 mb-4">
           {order.items.map((item) => (
             <div key={item.id} className="flex items-center gap-4">
               <div className="w-20 h-20 rounded-2xl overflow-hidden border border-[#e6e2dd]">
                 <img
                   src={item.thumbnail}
                   alt={item.name}
                   className="w-full h-full object-cover"
                 />
               </div>
               <div className="flex-1">
                 <p className="font-semibold text-lg text-[#2c2a28]">{item.name}</p>
                 <p className="text-sm text-[#7a746e]">{order.vendorName}</p>
                 <div className="flex items-center gap-2 mt-1">
                   <p className="font-medium text-base text-[#2c2a28]">₱{item.price}</p>
                   <span className="px-2 py-0.5 bg-[#f3f2f0] rounded-lg border border-[#e6e2dd] text-sm font-medium">
                     × {item.qty}
                   </span>
                 </div>
               </div>
               <div className="text-right font-medium text-base text-[#2c2a28]">
                 ₱{item.price * item.qty}
               </div>
             </div>
           ))}
         </div>
     
         {/* Price Breakdown */}
         <div className="border-t border-[#e6e2dd] my-4" />
         <div className="flex flex-col gap-2 mb-4">
           <div className="flex justify-between">
             <span className="text-base text-[#7a746e]">Subtotal</span>
             <span className="font-medium text-base text-[#2c2a28]">₱{order.subtotal}</span>
           </div>
           <div className="flex justify-between">
             <span className="text-base text-[#7a746e]">Delivery</span>
             <span className="font-medium text-base text-[#2c2a28]">₱{order.deliveryFee}</span>
           </div>
           <div className="flex justify-between">
             <span className="text-base text-[#7a746e]">✓ Total Paid</span>
             <span className="text-2xl font-semibold text-[#2e7d5b]">₱{order.total}</span>
           </div>
         </div>
     
         {/* Delivery Timeline */}
         <div className="mb-4">
           <DeliveryTimeline currentStep="out-for-delivery" />
         </div>
     
         {/* Courier + Tracking */}
         <div className="mb-4 p-3 bg-[#f3f2f0] rounded-lg border border-[#e6e2dd]">
           <p className="font-medium text-base text-[#2c2a28]">
             Courier: {order.courier}
           </p>
           <p className="text-sm text-[#7a746e]">Tracking: {order.trackingNumber}</p>
           <p className="text-sm text-[#7a746e]">
             Expected delivery today before 7:00 PM
           </p>
         </div>
     
         {/* Action Buttons */}
         <div className="flex flex-col sm:flex-row gap-3">
           <button className="flex-1 px-4 py-2 bg-[#2e7d5b] rounded-2xl border border-[#e6e2dd] text-white font-medium text-sm">
             Track Package
           </button>
           <button className="flex-1 px-4 py-2 bg-white rounded-2xl border border-[#e6e2dd] text-[#2c2a28] font-medium text-sm">
             Contact Vendor
           </button>
           <button className="flex-1 px-4 py-2 bg-white rounded-2xl border border-[#e6e2dd] text-[#2c2a28] font-medium text-sm">
             Report an Issue
           </button>
         </div>
       </div>
     )}


    {variant === "completed" && (
      <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-6 mb-6 border border-[#e6e2dd]">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="font-semibold text-2xl text-[#2c2a28] tracking-[-0.14px] leading-[36px]">
              {order.vendorName}
            </p>
            <p className="text-base text-[#7a746e] tracking-[-0.08px] leading-[24px]">
              Order #{order.orderNumber} • Placed {order.datePlaced}
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f3f2f0] rounded-2xl border border-[#e6e2dd]">
            <div className="w-3 h-3 bg-[#2e7d5b] rounded-full" />
            <span className="font-medium text-base text-[#2c2a28]">Completed</span>
          </div>
        </div>

        {/* Item List */}
        <div className="flex flex-col gap-4 mb-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border border-[#e6e2dd]">
                <img
                  src={item.thumbnail}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-lg text-[#2c2a28]">{item.name}</p>
                <p className="text-sm text-[#7a746e]">{order.vendorName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="font-medium text-base text-[#2c2a28]">₱{item.price}</p>
                  <span className="px-2 py-0.5 bg-[#f3f2f0] rounded-lg border border-[#e6e2dd] text-sm font-medium">
                    × {item.qty}
                  </span>
                </div>
              </div>
              <div className="text-right font-medium text-base text-[#2c2a28]">
                ₱{item.price * item.qty}
              </div>
            </div>
          ))}
        </div>

        {/* Price Breakdown */}
        <div className="border-t border-[#e6e2dd] my-4" />
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex justify-between">
            <span className="text-base text-[#7a746e]">Subtotal</span>
            <span className="font-medium text-base text-[#2c2a28]">₱{order.subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-base text-[#7a746e]">Delivery</span>
            <span className="font-medium text-base text-[#2c2a28]">₱{order.deliveryFee}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-base text-[#7a746e]">✓ Total Paid</span>
            <span className="text-2xl font-semibold text-[#2e7d5b]">₱{order.total}</span>
          </div>
        </div>

        {/* Delivered Info */}
        <div className="mb-4 p-3 bg-[#f3f2f0] rounded-lg border border-[#e6e2dd]">
          <p className="font-medium text-base text-[#2c2a28]">
            Delivered on {order.deliveredDate}
          </p>
          {order.recipient && (
            <p className="text-sm text-[#7a746e]">Received by {order.recipient}</p>
          )}
        </div>

        {/* Review Section */}
        <div className="mb-4">
          {order.reviewed ? (
            <p className="text-[#2c2a28] font-medium">★★★★★ {order.reviewSnippet}</p>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-base text-[#7a746e]">Share your experience:</p>
              {/* Placeholder stars */}
              <div className="flex gap-1 text-yellow-500 text-xl">
                ★ ★ ★ ★ ★
              </div>
              <button className="underline text-[#2e7d5b] text-sm font-medium">
                Leave a Review
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {!order.reviewed && (
            <button className="flex-1 px-4 py-2 bg-white rounded-2xl border border-[#e6e2dd] text-[#2c2a28] font-medium text-sm">
              Leave a Review
            </button>
          )}
          <button className="flex-1 px-4 py-2 bg-[#2e7d5b] rounded-2xl border border-[#e6e2dd] text-white font-medium text-sm">
            Buy Again
          </button>
          <button className="flex-1 px-4 py-2 bg-white rounded-2xl border border-[#e6e2dd] text-[#2c2a28] font-medium text-sm">
            View Receipt
          </button>
        </div>
      </div>
    )}
    </div>
  );
};
