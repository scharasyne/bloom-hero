import { PopupGalleryClient, PopupGalleryPhotoUpdate, PopupGalleryPhotoRow} from "../types";
import { normalizePopupGalleryPhoto } from "../utils/normalizePopupGallery";

export async function updatePopupGalleryPhoto(
  supabase: PopupGalleryClient,
  photoId: string,
  updates: PopupGalleryPhotoUpdate
) {
  const { data, error } = await supabase
    .from("popup_gallery_photos")
    .update({
      caption: updates.caption?.trim(),
      location: updates.location?.trim() || null,
      event_name: updates.eventName?.trim() || null,
      image_url: updates.imageUrl,
      display_order: updates.displayOrder,
    })
    .eq("id", photoId)
    .select("id, vendor_id, image_url, caption, location, event_name, display_order, created_at, updated_at")
    .single()

  if (error || !data) {
    throw new Error(error?.message || "Failed to update gallery photo.")
  }

  return normalizePopupGalleryPhoto(data as PopupGalleryPhotoRow)
}