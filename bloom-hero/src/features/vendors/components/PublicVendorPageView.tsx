import CustomerVendorProfile from "@/features/vendors/components/CustomerVendorProfile";
import CustomerVendorSchedulePanel from "@/features/pop-up/components/CustomerVendorSchedulePanel";
import type { PublicVendorPageData } from "@/features/vendors/queries/getPublicVendorPageData";

type PublicVendorPageViewProps = {
  data: PublicVendorPageData;
  canRequestLocation?: boolean;
};

export function PublicVendorPageView({ data, canRequestLocation = true }: PublicVendorPageViewProps) {
  const { vendor, products, schedule, galleryPhotos, reviews, businessType } = data;

  return (
    <main className="page-shell min-h-screen">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CustomerVendorProfile
            vendorId={vendor.id}
            vendor={vendor}
            products={products}
            reviews={reviews}
            galleryPhotos={galleryPhotos}
            businessType={businessType}
            canRequestLocation={canRequestLocation}
          />
        </div>
        <aside className="lg:col-span-1">
          <CustomerVendorSchedulePanel schedule={schedule} vendorName={vendor.shop_name} />
        </aside>
      </div>
    </main>
  );
}
