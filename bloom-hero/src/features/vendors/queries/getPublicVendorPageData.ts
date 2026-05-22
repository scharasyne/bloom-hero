import { getSession } from "@/features/auth/queries/getSession";
import { getPopUpGalleryPhotosByVendor } from "@/features/pop-up/queries/getPopupGalleryPhotosByVendor";
import { getPopUpSchedule } from "@/features/pop-up/queries/getPopupSchedule";
import { getVendorProducts } from "@/features/products/queries/getVendorProducts";
import { getVendorReviews } from "@/features/reviews/actions/getVendorReviews";
import type { BusinessType } from "@/features/vendors/types";
import { normalizeBusinessType } from "@/features/vendors/utils/normalizeBusinessType";
import { getVendorOfferings } from "@/features/vendors/utils/vendorOfferings";
import type { PopUpGalleryPhoto, PopUpSchedule, Product, Vendor, VendorReview } from "@/features/vendors/interface";
import { getVendorProfile } from "./getVendorProfile";
import { getVendorProfileByOwnerId } from "./getVendorProfileByOwnerId";

export type PublicVendorPageData = {
  vendor: Vendor;
  products: Product[];
  schedule: PopUpSchedule[];
  galleryPhotos: PopUpGalleryPhoto[];
  reviews: VendorReview[];
  businessType: BusinessType;
  holdsPopups: boolean;
  offersOnlineOrders: boolean;
};

async function canIncludeUnapprovedVendor(vendorId: string): Promise<boolean> {
  const session = await getSession();
  if (session.profile?.role === "admin") return true;
  if (!session.user) return false;

  try {
    const ownVendor = await getVendorProfileByOwnerId(session.user.id);
    return ownVendor?.id === vendorId;
  } catch {
    return false;
  }
}

export async function getPublicVendorPageData(
  vendorId: string
): Promise<PublicVendorPageData | null> {
  const includeUnapproved = await canIncludeUnapprovedVendor(vendorId);

  const [vendor, products, schedule, galleryPhotos, reviews] = await Promise.all([
    getVendorProfile(vendorId, { includeUnapproved }),
    getVendorProducts(vendorId),
    getPopUpSchedule(vendorId),
    getPopUpGalleryPhotosByVendor(vendorId),
    getVendorReviews(vendorId),
  ]);

  if (!vendor) return null;

  const businessType = normalizeBusinessType(vendor.business_type) ?? "unregistered";
  const offerings = getVendorOfferings({
    businessType,
    holdsPopups: vendor.holds_popups,
  });

  return {
    vendor,
    products: offerings.offersOnlineOrders ? products : [],
    schedule: offerings.holdsPopups ? schedule : [],
    galleryPhotos: offerings.holdsPopups ? galleryPhotos : [],
    reviews,
    businessType,
    holdsPopups: offerings.holdsPopups,
    offersOnlineOrders: offerings.offersOnlineOrders,
  };
}
