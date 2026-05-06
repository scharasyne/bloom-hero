"use client";

import { Icon } from "@iconify/react";

const revenueTakeRate = 0.01;

const commissionExamples = [
  { order: 500, commission: 5 },
  { order: 1000, commission: 10 },
  { order: 2500, commission: 25 },
];

const adminTasks = [
  {
    title: "Approve vendor applications",
    description: "Review submitted vendor profiles before they can go live.",
    icon: "mdi:account-check-outline",
    tone: "bg-[#eef4f0] text-[#2f5d3a]",
  },
  {
    title: "Approve customer reviews",
    description: "Keep genuine reviews visible after quick moderation.",
    icon: "mdi:star-check-outline",
    tone: "bg-[#fff7f6] text-[#D24B46]",
  },
  {
    title: "Flag inappropriate reviews",
    description: "Hide abusive, spammy, or off-topic content for review.",
    icon: "mdi:flag-outline",
    tone: "bg-[#fbf7f4] text-[#6b6b6b]",
  },
  {
    title: "Suspend bad actors",
    description: "Temporarily suspend customer or vendor accounts if behavior escalates.",
    icon: "mdi:account-cancel-outline",
    tone: "bg-[#f3eee8] text-[#1f1f1f]",
  },
];

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[24px] border border-[#edeae6] bg-white p-5 shadow-[0px_8px_24px_rgba(0,0,0,0.04)]">
      <div className="mb-4">
        <h2 className="text-[18px] font-semibold text-[#1f1f1f]">{title}</h2>
        {subtitle ? <p className="mt-1 text-[13px] text-[#7a7a7a]">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Metric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-[20px] border border-[#edeae6] bg-[#fbf7f4] p-4">
      <p className="text-[13px] font-medium text-[#7a7a7a]">{label}</p>
      <p className="mt-2 text-[28px] font-semibold leading-none text-[#1f1f1f]">{value}</p>
      <p className="mt-2 text-[12px] text-[#9a9288]">{hint}</p>
    </div>
  );
}

function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "success" | "warning" | "danger" }) {
  const classes =
    tone === "success"
      ? "bg-[#eef4f0] text-[#2f5d3a]"
      : tone === "warning"
      ? "bg-[#fff7f6] text-[#D24B46]"
      : tone === "danger"
      ? "bg-[#f8e9e7] text-[#b43f39]"
      : "bg-[#f3eee8] text-[#4d4a46]";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-semibold ${classes}`}>
      {children}
    </span>
  );
}

// ✅ No outer wrappers, no spacer div, no duplicate padding — layout handles all of that
export default function AdminDashboardPage() {
  return (
    <>
      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="mb-6 flex flex-col gap-4 rounded-[28px] border border-[#edeae6] bg-white px-5 py-5 shadow-[0px_8px_24px_rgba(0,0,0,0.04)] lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-[#7a7a7a]">Admin dashboard</p>
          <h1 className="mt-1 text-[28px] font-semibold leading-tight text-[#1f1f1f] lg:text-[34px]">
            Operations overview
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] text-[#7a7a7a]">
            Monitor vendor approvals, review moderation, account health, and marketplace commissions at a glance.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button className="inline-flex items-center gap-2 rounded-full border border-[#e1dbd4] bg-white px-4 py-2.5 text-sm font-semibold text-[#1f1f1f] transition-colors hover:bg-[#faf7f4]">
            <Icon icon="mdi:calendar-outline" width={18} height={18} />
            This week
          </button>
          <button className="inline-flex items-center gap-2 rounded-full bg-[#D24B46] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#b43f39]">
            <Icon icon="mdi:shield-check-outline" width={18} height={18} />
            Review queue
          </button>
        </div>
      </div>

      {/* ── Metrics ─────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Orders processed" value="1,284" hint="Current month throughput" />
        <Metric label="Platform commission" value="₱12.84k" hint={`${Math.round(revenueTakeRate * 100)}% of total order value`} />
        <Metric label="Pending moderation" value="18" hint="Vendor apps + reviews" />
        <Metric label="Accounts flagged" value="4" hint="Requires admin action" />
      </div>

      {/* ── Commission + Responsibilities ───────────────────────── */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard title="Commission example" subtitle="If the platform keeps 1% of every completed order total from a shop.">
          <div className="overflow-hidden rounded-[18px] border border-[#edeae6]">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-[#fbf7f4] text-[#7a7a7a]">
                <tr>
                  <th className="px-4 py-3 font-medium">Order total</th>
                  <th className="px-4 py-3 font-medium">Platform fee</th>
                  <th className="px-4 py-3 font-medium">Vendor keeps</th>
                </tr>
              </thead>
              <tbody>
                {commissionExamples.map((row) => (
                  <tr key={row.order} className="border-t border-[#edeae6] bg-white">
                    <td className="px-4 py-4 font-semibold text-[#1f1f1f]">₱{row.order.toLocaleString()}</td>
                    <td className="px-4 py-4 text-[#7a7a7a]">₱{row.commission.toLocaleString()}</td>
                    <td className="px-4 py-4 text-[#1f1f1f]">₱{(row.order - row.commission).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[13px] text-[#7a7a7a]">
            Example: a ₱750 order would generate a ₱7.50 commission for the platform, before payment processing fees.
          </p>
        </SectionCard>

        <SectionCard title="Admin responsibilities" subtitle="Keep the platform safe, clean, and trustworthy.">
          <div className="grid gap-3">
            {adminTasks.map((task) => (
              <div key={task.title} className={`rounded-[18px] p-4 ${task.tone}`}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-white/80 p-2">
                    <Icon icon={task.icon} width={18} height={18} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[#1f1f1f]">{task.title}</p>
                    <p className="mt-1 text-[13px] text-[#7a7a7a]">{task.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* ── Moderation queue + Account controls ─────────────────── */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SectionCard title="Moderation queue" subtitle="Vendor applications and customer reviews awaiting action.">
          <div className="space-y-3">
            {[
              { title: "Sampaguita Street", meta: "Vendor application • Carbon Market", status: "Approve", tone: "warning" },
              { title: "Maria Santos", meta: "Review • Product page", status: "Approve / Flag", tone: "neutral" },
              { title: "Anonymous review", meta: "Spam score high", status: "Flag", tone: "danger" },
            ].map((item) => (
              <div key={item.title} className="rounded-[18px] border border-[#edeae6] bg-[#fbf7f4] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[#1f1f1f]">{item.title}</p>
                    <p className="mt-1 text-[13px] text-[#7a7a7a]">{item.meta}</p>
                  </div>
                  <Badge tone={item.tone as any}>{item.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Account controls" subtitle="Suspend accounts when behavior becomes abusive or unsafe.">
          <div className="space-y-3">
            {[
              { name: "Zarah's Flowers", reason: "Repeated policy violations", action: "Suspend vendor" },
              { name: "Customer account", reason: "Harassment in review threads", action: "Suspend customer" },
              { name: "Inactive vendor", reason: "No response to moderation requests", action: "Review" },
            ].map((row) => (
              <div key={row.name} className="rounded-[18px] border border-[#edeae6] bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[#1f1f1f]">{row.name}</p>
                    <p className="mt-1 text-[13px] text-[#7a7a7a]">{row.reason}</p>
                  </div>
                  <button className="rounded-full border border-[#e1dbd4] px-3 py-1.5 text-[12px] font-semibold text-[#1f1f1f] transition-colors hover:bg-[#faf7f4]">
                    {row.action}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </>
  );
}