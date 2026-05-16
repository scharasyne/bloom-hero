// Source: `src/app/(customer)/orders/_lib/constants.ts`

/*
  —————————————————— IS THIS EVEN NEEDED? ——————————————————
              REMOVE IF NOT A DEPENDENCY OF ANYTHING
*/


export type TabKey = "to-pay" | "to-ship" | "to-receive" | "completed";

export const TABS: { key: TabKey; label: string }[] = [
  { key: "to-pay",     label: "To Pay" },
  { key: "to-ship",    label: "To Ship" },
  { key: "to-receive", label: "To Receive" },
  { key: "completed",  label: "Completed" },
];

export const TAB_STATUS_MAP: Record<TabKey, string[]> = {
  "to-pay":     ["to_pay", "pending"],
  "to-ship":    ["to_ship", "confirmed"],
  "to-receive": ["to_receive", "shipped"],
  "completed":  ["completed"],
};

/*
  FIX 5: Semantic badge colors per status.
  Each state has a distinct hue so the customer can read status at a glance
  without needing to read the text label.
    pending payment      → amber   (needs action — warm urgency)
    pending confirmation → blue    (awaiting vendor review)
    confirmed            → purple  (vendor accepted and shipped)
    completed            → green   (positive resolution)
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
    label:  "Pending Confirmation",
  },
  "to-receive": {
    bg:     "bg-purple-50",
    border: "border-purple-200",
    text:   "text-purple-700",
    label:  "Confirmed",
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
  "to-ship":    { heading: "Nothing to ship yet",     body: "Orders awaiting confirmation will appear here." },
  "to-receive": { heading: "Nothing on the way yet",  body: "Confirmed orders on the way will appear here." },
  "completed":  { heading: "No completed orders yet", body: "Once you receive an order, it will appear here." },
};
