import DesktopClient from "../_components/DesktopClient";

type PackageTier = {
  price: string;
  name: string;
  summary: string;
  features: string[];
};

const packages: PackageTier[] = [
  {
    price: "₱99",
    name: "Starter",
    summary: "Post pop-ups only with a weekly cap. Ideal for testing demand.",
    features: [
      "Posting of pop ups only",
      "Limited to 3 pop ups per week",
      "Basic listing visibility",
    ],
  },
  {
    price: "₱150",
    name: "Plus",
    summary: "Receive pop-up requests with no listing limit.",
    features: [
      "Receive pop up requests",
      "No pop up listing limit",
      "Priority placement in pop-up search",
    ],
  },
  {
    price: "₱249",
    name: "Pro",
    summary: "Post products and schedules plus unlimited pop-up listings.",
    features: [
      "Post products",
      "List pop up schedule",
      "Receive pop up requests",
      "No pop up listing limit",
      "No analytics about what's trending",
    ],
  },
  {
    price: "₱349",
    name: "Pro Max",
    summary: "Everything included, plus analytics for what’s trending.",
    features: [
      "Complete with everything",
      "Includes analytics",
      "Trend and demand snapshots",
    ],
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
              className="flex flex-col gap-4 rounded-2xl border border-[#edeae6] bg-white p-6 shadow-[0_16px_40px_rgba(31,31,31,0.08)]"
            >
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="font-semibold text-[#1f1f1f] text-[20px] tracking-[0.2px]">
                    {tier.name}
                  </p>
                  <p className="font-medium text-[#7a7a7a] text-[14px]">{tier.summary}</p>
                </div>
                <span className="font-bold text-[#2f5d3a] text-[22px]">{tier.price}</span>
              </div>
              <div className="h-px bg-[#edeae6]" />
              <ul className="flex flex-col gap-2 text-[#3f3a35] text-[14px]">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <span className="mt-[6px] inline-block size-1.5 rounded-full bg-[#d24b46]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function PackagePage() {
  return <DesktopClient extraSection={<PackageSection />} />;
}
