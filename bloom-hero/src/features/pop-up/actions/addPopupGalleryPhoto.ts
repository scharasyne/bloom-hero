import { PopupGalleryClient, PopupGalleryPhotoInput, PopupGalleryPhotoRow} from "../types";
import { normalizePopupGalleryPhoto } from "../utils/normalizePopupGallery";

export async function addPopupGalleryPhoto(
  supabase: PopupGalleryClient,
  input: PopupGalleryPhotoInput
) {
  const { data, error } = await supabase
    .from("popup_gallery_photos")
    .insert({
      vendor_id: input.vendorId,
      image_url: input.imageUrl,
      caption: input.caption,
      location: input.location?.trim() || null,
      event_name: input.eventName?.trim() || null,
      display_order: input.displayOrder ?? 0,
    })
    .select("id, vendor_id, image_url, caption, location, event_name, display_order, created_at, updated_at")
    .single()

  if (error || !data) {
    throw new Error(error?.message || "Failed to add gallery photo.")
  }

  return normalizePopupGalleryPhoto(data as PopupGalleryPhotoRow)
}