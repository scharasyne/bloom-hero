import React from "react";

interface DeliveryTimelineProps {
  currentStep: "paid" | "preparing" | "shipped" | "out-for-delivery" | "delivered";
}

const steps = ["Paid", "Preparing", "Shipped", "Out for Delivery", "Delivered"];

export const DeliveryTimeline: React.FC<DeliveryTimelineProps> = ({ currentStep }) => {
  const currentIndex = steps.findIndex(
    (s) => s.toLowerCase().replace(/ /g, "-") === currentStep
  );

  return (
    <div className="flex items-center gap-4">
      {steps.map((step, idx) => (
        <div key={step} className="flex items-center gap-2">
          <div
            className={`w-4 h-4 rounded-full ${
              idx <= currentIndex ? "bg-[#2f6b4f]" : "border border-gray-400"
            }`}
          />
          <span
            className={`text-sm ${
              idx === currentIndex ? "font-bold text-[#2f6b4f]" : "text-gray-500"
            }`}
          >
            {step}
          </span>
          {idx < steps.length - 1 && <div className="w-8 h-px bg-gray-300" />}
        </div>
      ))}
    </div>
  );
};
