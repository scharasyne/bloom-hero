import { cn } from "@/lib/utils";
import { VendorDashboardSidebarCard } from "@/features/vendors/components/VendorDashboardSidebarCard";
import type { BusinessType } from "@/features/vendors/types";

type VendorTabId =
  | "dashboard"
  | "products"
  | "orders"
  | "messages"
  | "profile"
  | "schedule"
  | "settings";

type VendorPageShellProps = {
  activeTab: VendorTabId;
  businessType: BusinessType;
  children: React.ReactNode;
  className?: string;
  mainClassName?: string;
  fixedMain?: boolean;
};

export function VendorPageShell({
  activeTab,
  businessType,
  children,
  className,
  mainClassName,
  fixedMain = false,
}: VendorPageShellProps) {
  return (
    <main
      className={cn("vendor-layout text-[#1f1f1f]", className)}
      style={{ fontFamily: "'Quicksand', sans-serif" }}
    >
      <div className="vendor-nav-slot">
        <VendorDashboardSidebarCard activeTab={activeTab} businessType={businessType} />
      </div>
      <div className={cn(fixedMain ? "vendor-main-fixed" : "vendor-main", mainClassName)}>
        {children}
      </div>
    </main>
  );
}
