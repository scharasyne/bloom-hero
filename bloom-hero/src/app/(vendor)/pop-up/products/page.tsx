import VendorListProductPage from "@/features/products/components/ListProduct";
// import { VendorDashboardSidebarCard } from "@/app/(vendor)/_components/vendor-dashboard-sidebar-card";

export default function PopupProductPage(){
  return(
    <div className="p-4 sm:p-6 lg:p-8">
      <VendorListProductPage type="pop-up"/>
    </div>      
  )
}