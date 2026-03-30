export type TabKey = "to-pay" | "to-ship" | "to-receive" | "completed";

export const TABS: { key: TabKey; label: string }[] = [
  { key: "to-pay",     label: "To Pay" },
  { key: "to-ship",    label: "To Ship" },
  { key: "to-receive", label: "To Receive" },
  { key: "completed",  label: "Completed" },
];

// Maps each tab to your actual orders.status value in Supabase
export const TAB_STATUS_MAP: Record<TabKey, string> = {
  "to-pay":     "pending",
  "to-ship":    "confirmed",
  "to-receive": "shipped",
  "completed":  "completed",
};

export const STATUS_BADGE: Record<TabKey, { bg: string; border: string; text: string; label: string }> = {
  "to-pay": {
    bg:     "bg-[#fdf6ec]",   // warm cream tinted amber
    border: "border-[#e8d5b0]",
    text:   "text-[#8a6420]", // dark warm gold — readable, not neon
    label:  "Pending Payment",
  },
  "to-ship": {
    bg:     "bg-[#eef4fb]",   // very pale slate blue
    border: "border-[#bdd0e8]",
    text:   "text-[#2c5282]", // deep navy — calm, not electric
    label:  "Confirmed",
  },
  "to-receive": {
    bg:     "bg-[#f3f0f9]",   // pale dusty lavender
    border: "border-[#cfc7e8]",
    text:   "text-[#4a3880]", // deep plum — soft, not neon purple
    label:  "Shipped",
  },
  "completed": {
    bg:     "bg-[#eef6ee]",   // pale sage green
    border: "border-[#b8d9b8]",
    text:   "text-[#2d5a2d]", // deep forest green — matches your brand green
    label:  "Completed",
  },
};

export const EMPTY_STATE: Record<TabKey, { heading: string; body: string }> = {
  "to-pay":     { heading: "No pending payments",     body: "Orders waiting for payment will appear here." },
  "to-ship":    { heading: "Nothing to ship yet",      body: "Confirmed orders will appear here." },
  "to-receive": { heading: "Nothing on the way yet",   body: "Shipped orders will appear here." },
  "completed":  { heading: "No completed orders yet",  body: "Once you receive an order, it will appear here." },
};