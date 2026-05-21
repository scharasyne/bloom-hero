import { Icon } from "@iconify/react";
import DesktopClient from "../_components/DesktopClient";

type PackageTier = {
  price: string;
  name: string;
  icon: string;
  summary: string;
  pros: string[];
  cons: string[];
};

const packages: PackageTier[] = [
  {
    price: "FREE",
    name: "Starter",
    icon: "mdi:seed-outline",
    summary: "Lightweight entry for testing demand.",
    pros: ["1 listing per week"],
    cons: ["Can't view customer requests", "Can't see reviews"],
  },
  {
    price: "₱169",
    name: "Plus",
    icon: "mdi:sprout-outline",
    summary: "Full request visibility with unlimited listings.",
    pros: [
      "Unlimited listings",
      "See and receive customer requests",
      "See reviews",
    ],
    cons: [],
  },
  {
    price: "₱299",
    name: "Pro",
    icon: "mdi:flower-outline",
    summary: "Products, listings, requests, and reviews included.",
    pros: [
      "Post products",
      "Manage listings",
      "Receive customer requests",
      "See reviews",
    ],
    cons: ["No analytics about what flowers people love"],
  },
  {
    price: "₱399",
    name: "Pro Max",
    icon: "mdi:crown-outline",
    summary: "Everything included with insights and highlights.",
    pros: [
      "Everything included",
      "Analytics",
      "Priority placement (highlights)",
    ],
    cons: [],
  },
];

function PackageSection() {
  return (
    <section className="w-full max-w-6xl mx-auto px-0 sm:px-2 lg:px-0 pb-16 mt-10">
      <div className="rounded-3xl border border-[#edeae6] bg-[#fbfaf8] p-6 sm:p-10 shadow-[0_25px_60px_rgba(15,15,15,0.08)]">
        <div className="flex flex-col gap-3 text-center">
          <p className="font-medium text-[#7a7a7a] text-[14px] tracking-[0.32px]">SUBSCRIPTION PACKAGES</p>
          <h2 className="font-semibold text-[#1f1f1f] text-[26px] sm:text-[34px] tracking-[0.3px]">
            Choose the plan that fits your shop's presence
          </h2>
          {/* <p className="font-semibold text-[#6f6a65] text-[15px] max-w-2xl mx-auto">
            Proof-of-concept pricing for demo only. This page is not a live feature yet.
          </p> */}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {packages.map((tier) => (
            <div
              key={tier.name}
              className="flex flex-col gap-4 rounded-2xl border border-[#edeae6] bg-white p-6 shadow-[0_16px_40px_rgba(31,31,31,0.08)] h-full"
            >
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-full bg-[#f3efe8]">
                      <Icon icon={tier.icon} width={18} height={18} className="text-[#2f5d3a]" />
                    </span>
                    <p className="font-semibold text-[#1f1f1f] text-[20px] tracking-[0.2px]">
                      {tier.name}
                    </p>
                  </div>
                  <p className="font-medium text-[#7a7a7a] text-[14px]">{tier.summary}</p>
                </div>
                <span className="font-bold text-[#2f5d3a] text-[22px]">{tier.price}</span>
              </div>
              <div className="h-px bg-[#edeae6]" />
              <ul className="flex flex-col gap-2 text-[#3f3a35] text-[14px] flex-1">
                {tier.pros.map((feature) => (
                  <li key={`pro-${feature}`} className="flex gap-2 items-start">
                    <Icon
                      icon="mdi:check-circle-outline"
                      width={18}
                      height={18}
                      className="text-[#2f5d3a] mt-[2px] shrink-0"
                    />
                    <span>{feature}</span>
                  </li>
                ))}
                {tier.cons.map((feature) => (
                  <li key={`con-${feature}`} className="flex gap-2 items-start">
                    <Icon
                      icon="mdi:close-circle-outline"
                      width={18}
                      height={18}
                      className="text-[#d24b46] mt-[2px] shrink-0"
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="cursor-pointer mt-auto rounded-full border border-[#2f5d3a] px-4 py-2 text-[13px] font-semibold text-[#2f5d3a] hover:bg-[#2f5d3a] hover:text-white transition-colors"
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            className="cursor-pointer rounded-full bg-[#2f5d3a] px-6 py-3 text-[14px] font-semibold text-white hover:bg-[#264c30] transition-colors"
          >
            View All Packages
          </button>
        </div>
      </div>
    </section>
  );
}

export default function PackagePage() {
  return <DesktopClient extraSection={<PackageSection />} />;
}
