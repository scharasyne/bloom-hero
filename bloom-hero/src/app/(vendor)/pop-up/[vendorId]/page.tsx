import { redirect } from "next/navigation";
import type { Metadata } from "next";
import CustomerVendorProfile from "@/app/(vendor)/_components/CustomerVendorProfile";
import CustomerVendorSchedulePanel from "@/app/(vendor)/_components/CustomerVendorSchedulePanel";
import { getPopUpGalleryPhotosByVendor } from "@/features/pop-up/queries/getPopupGalleryPhotosByVendor";
import { getPopUpSchedule } from "@/features/pop-up/queries/getPopupSchedule";
import { getVendorProfile } from "@/features/vendors/queries/getVendorProfile";
import { getVendorProducts } from "@/features/products/queries/getVendorProducts";
import { getVendorReviews } from "@/features/reviews/queries/getVendorReviews";

export const metadata: Metadata = {
  title: "Pop-up Vendor",
  description: "Browse pop-up vendor bouquets and schedule.",
};

interface PopUpVendorPageProps {
  params: Promise<{
    vendorId: string;
  }>;
}

export default async function PopUpVendorPage({
  params,
}: PopUpVendorPageProps) {
  const { vendorId } = await params;

  /*
    TO BE ADDED: what to do if its not a popup vendor
    OR: check if there are already previous checks that'll render role checking here 
    redundant or useless
  */

  const [vendor, products, schedule, galleryPhotos, reviews] = await Promise.all([
    getVendorProfile(vendorId),
    getVendorProducts(vendorId),
    getPopUpSchedule(vendorId),
    getPopUpGalleryPhotosByVendor(vendorId),
    getVendorReviews(vendorId),
  ]);

  
  if (!vendor) {
    // redirect("/customer/dashboard");
    redirect("/search?scope=vendors");
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CustomerVendorProfile
            vendorId={vendor.id}
            vendor={vendor}
            products={products}
            reviews={reviews}
            galleryPhotos={galleryPhotos}
            vendorType="pop-up"
          />
        </div>

        <aside className="lg:col-span-1">
          <CustomerVendorSchedulePanel
            schedule={schedule}
            vendorName={vendor.shop_name}
          />
        </aside>
      </div>
    </main>
  );
}