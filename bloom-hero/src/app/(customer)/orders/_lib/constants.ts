export type TabKey = "to-pay" | "to-ship" | "to-receive" | "completed";

export const TABS: { key: TabKey; label: string }[] = [
  { key: "to-pay",     label: "To Pay" },
  { key: "to-ship",    label: "To Ship" },
  { key: "to-receive", label: "To Receive" },
  { key: "completed",  label: "Completed" },
];

export const TAB_STATUS_MAP: Record<TabKey, string> = {
  "to-pay":     "pending",
  "to-ship":    "confirmed",
  "to-receive": "shipped",
  "completed":  "completed",
};

/*
  FIX 5: Semantic badge colors per status.
  Each state has a distinct hue so the customer can read status at a glance
  without needing to read the text label.
    pending   → amber   (needs action — warm urgency)
    confirmed → blue    (in progress — calm, informational)
    shipped   → purple  (in transit — distinct from confirmed)
    completed → green   (positive resolution)
*/
export const STATUS_BADGE: Record<TabKey, { bg: string; border: string; text: string; label: string }> = {
  "to-pay": {
    bg:     "bg-amber-50",
    border: "border-amber-200",
    text:   "text-amber-700",
    label:  "Pending Payment",
  },
  "to-ship": {
    bg:     "bg-blue-50",
    border: "border-blue-200",
    text:   "text-blue-700",
    label:  "Confirmed",
  },
  "to-receive": {
    bg:     "bg-purple-50",
    border: "border-purple-200",
    text:   "text-purple-700",
    label:  "Shipped",
  },
  "completed": {
    bg:     "bg-emerald-50",
    border: "border-emerald-200",
    text:   "text-emerald-700",
    label:  "Completed",
  },
};

export const EMPTY_STATE: Record<TabKey, { heading: string; body: string }> = {
  "to-pay":     { heading: "No pending payments",    body: "Orders waiting for payment will appear here." },
  "to-ship":    { heading: "Nothing to ship yet",     body: "Confirmed orders will appear here." },
  "to-receive": { heading: "Nothing on the way yet",  body: "Shipped orders will appear here." },
  "completed":  { heading: "No completed orders yet", body: "Once you receive an order, it will appear here." },
};