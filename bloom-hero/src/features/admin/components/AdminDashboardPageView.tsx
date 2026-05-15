"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import type { AdminDashboardData, AdminDashboardModerationTone } from "@/features/admin/types";
import {
  COMMISSION_EXAMPLES,
  REVENUE_TAKE_RATE,
} from "@/features/admin/utils/adminDashboardConstants";
import { formatOrderCount, formatPesoCompact } from "@/features/admin/utils/formatAdminCurrency";

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
    description: "Temporarily suspend vendor accounts if behavior escalates.",
    icon: "mdi:account-cancel-outline",
    tone: "bg-[#f3eee8] text-[#1f1f1f]",
  },
] as const;

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
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

function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: AdminDashboardModerationTone;
}) {
  const classes =
    tone === "warning"
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

type AdminDashboardPageViewProps = {
  data: AdminDashboardData;
};

export function AdminDashboardPageView({ data }: AdminDashboardPageViewProps) {
  const pendingModeration = data.pendingApplicationCount + data.pendingReviewCount;

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 rounded-[28px] border border-[#edeae6] bg-white px-5 py-5 shadow-[0px_8px_24px_rgba(0,0,0,0.04)] lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-[#7a7a7a]">
            Admin dashboard
          </p>
          <h1 className="mt-1 text-[28px] font-semibold leading-tight text-[#1f1f1f] lg:text-[34px]">
            Operations overview
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] text-[#7a7a7a]">
            Monitor vendor approvals, review moderation, account health, and marketplace
            commissions at a glance.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#e1dbd4] bg-white px-4 py-2.5 text-sm font-semibold text-[#1f1f1f]">
            <Icon icon="mdi:calendar-outline" width={18} height={18} />
            This month
          </span>
          <Link
            href={data.reviewQueueHref}
            className="inline-flex items-center gap-2 rounded-full bg-[#D24B46] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#b43f39]"
          >
            <Icon icon="mdi:shield-check-outline" width={18} height={18} />
            Review queue
            {pendingModeration > 0 ? ` (${pendingModeration})` : ""}
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Orders processed"
          value={formatOrderCount(data.ordersProcessedThisMonth)}
          hint="Non-cancelled orders this month"
        />
        <Metric
          label="Platform commission"
          value={formatPesoCompact(data.platformCommissionThisMonth)}
          hint={`${Math.round(REVENUE_TAKE_RATE * 100)}% of order value this month`}
        />
        <Metric
          label="Pending moderation"
          value={formatOrderCount(pendingModeration)}
          hint={`${data.pendingApplicationCount} apps · ${data.pendingReviewCount} reviews`}
        />
        <Metric
          label="Suspended vendors"
          value={formatOrderCount(data.suspendedVendorCount)}
          hint="Accounts currently suspended"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard
          title="Commission example"
          subtitle="If the platform keeps 1% of every completed order total from a shop."
        >
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
                {COMMISSION_EXAMPLES.map((row) => (
                  <tr key={row.order} className="border-t border-[#edeae6] bg-white">
                    <td className="px-4 py-4 font-semibold text-[#1f1f1f]">
                      ₱{row.order.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-[#7a7a7a]">₱{row.commission.toLocaleString()}</td>
                    <td className="px-4 py-4 text-[#1f1f1f]">
                      ₱{(row.order - row.commission).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[13px] text-[#7a7a7a]">
            Live commission this month: {formatPesoCompact(data.platformCommissionThisMonth)} from{" "}
            {formatOrderCount(data.ordersProcessedThisMonth)} orders.
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

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SectionCard
          title="Moderation queue"
          subtitle="Vendor applications and customer reviews awaiting action."
        >
          {data.moderationQueue.length === 0 ? (
            <p className="rounded-[18px] border border-dashed border-[#edeae6] bg-[#fbf7f4] px-4 py-6 text-sm text-[#7a7a7a]">
              No pending vendor applications or reviews.
            </p>
          ) : (
            <div className="space-y-3">
              {data.moderationQueue.map((item) => (
                <Link
                  key={`${item.kind}-${item.id}`}
                  href={item.href}
                  className="block rounded-[18px] border border-[#edeae6] bg-[#fbf7f4] p-4 transition-colors hover:border-[#d8d0c7]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-[#1f1f1f]">{item.title}</p>
                      <p className="mt-1 text-[13px] text-[#7a7a7a]">{item.meta}</p>
                    </div>
                    <Badge tone={item.tone}>{item.statusLabel}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Suspended vendors"
          subtitle="Vendors currently suspended from the marketplace."
        >
          {data.suspendedVendors.length === 0 ? (
            <p className="rounded-[18px] border border-dashed border-[#edeae6] bg-[#fbf7f4] px-4 py-6 text-sm text-[#7a7a7a]">
              No suspended vendors right now.
            </p>
          ) : (
            <div className="space-y-3">
              {data.suspendedVendors.map((row) => (
                <div key={row.id} className="rounded-[18px] border border-[#edeae6] bg-white p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-[#1f1f1f]">{row.name}</p>
                      <p className="mt-1 text-[13px] text-[#7a7a7a]">{row.reason}</p>
                    </div>
                    <Link
                      href="/admin/vendors"
                      className="rounded-full border border-[#e1dbd4] px-3 py-1.5 text-[12px] font-semibold text-[#1f1f1f] transition-colors hover:bg-[#faf7f4]"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </>
  );
}
