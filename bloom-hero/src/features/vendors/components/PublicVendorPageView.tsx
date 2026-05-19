import CustomerVendorProfile from "@/features/vendors/components/CustomerVendorProfile";
import CustomerVendorSchedulePanel from "@/features/pop-up/components/CustomerVendorSchedulePanel";
import type { PublicVendorPageData } from "@/features/vendors/queries/getPublicVendorPageData";

type PublicVendorPageViewProps = {
  data: PublicVendorPageData;
  canRequestLocation?: boolean;
};

export function PublicVendorPageView({ data, canRequestLocation = true }: PublicVendorPageViewProps) {
  const {
    vendor,
    products,
    schedule,
    galleryPhotos,
    reviews,
    businessType,
    holdsPopups,
    offersOnlineOrders,
  } = data;
  const showLocationRequests = canRequestLocation && holdsPopups;

  return (
    <main className="page-shell min-h-screen">
      <div className={`grid gap-8 ${holdsPopups ? "lg:grid-cols-3" : "lg:grid-cols-1"}`}>
        <div className={holdsPopups ? "lg:col-span-2" : ""}>
          <CustomerVendorProfile
            vendorId={vendor.id}
            vendor={vendor}
            products={products}
            reviews={reviews}
            galleryPhotos={galleryPhotos}
            businessType={businessType}
            offersOnlineOrders={offersOnlineOrders}
            canRequestLocation={showLocationRequests}
          />
        </div>
        {holdsPopups ? (
          <aside className="lg:col-span-1">
            <CustomerVendorSchedulePanel schedule={schedule} vendorName={vendor.shop_name} />
          </aside>
        ) : null}
      </div>
    </main>
  );
}
