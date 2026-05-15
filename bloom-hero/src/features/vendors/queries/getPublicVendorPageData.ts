import { getPopUpGalleryPhotosByVendor } from "@/features/pop-up/queries/getPopupGalleryPhotosByVendor";
import { getPopUpSchedule } from "@/features/pop-up/queries/getPopupSchedule";
import { getVendorProducts } from "@/features/products/queries/getVendorProducts";
import { getVendorReviews } from "@/features/reviews/actions/getVendorReviews";
import type { BusinessType } from "@/features/vendors/types";
import { normalizeBusinessType } from "@/features/vendors/utils/normalizeBusinessType";
import type { PopUpGalleryPhoto, PopUpSchedule, Product, Vendor, VendorReview } from "@/features/vendors/interface";
import { getVendorProfile } from "./getVendorProfile";

export type PublicVendorPageData = {
  vendor: Vendor;
  products: Product[];
  schedule: PopUpSchedule[];
  galleryPhotos: PopUpGalleryPhoto[];
  reviews: VendorReview[];
  businessType: BusinessType;
};

export async function getPublicVendorPageData(
  vendorId: string
): Promise<PublicVendorPageData | null> {
  const [vendor, products, schedule, galleryPhotos, reviews] = await Promise.all([
    getVendorProfile(vendorId),
    getVendorProducts(vendorId),
    getPopUpSchedule(vendorId),
    getPopUpGalleryPhotosByVendor(vendorId),
    getVendorReviews(vendorId),
  ]);

  if (!vendor) return null;

  return {
    vendor,
    products,
    schedule,
    galleryPhotos,
    reviews,
    businessType: normalizeBusinessType(vendor.business_type) ?? "unregistered",
  };
}
