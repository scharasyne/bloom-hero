import { cn } from "@/lib/utils";
import { VendorDashboardSidebarCard } from "@/features/vendors/components/VendorDashboardSidebarCard";
import type { BusinessType } from "@/features/vendors/types";
import type { VendorNavItemId } from "@/features/vendors/utils/vendorNavConfig";

type VendorPageShellProps = {
  activeTab: VendorNavItemId;
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
