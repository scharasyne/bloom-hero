import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { PopupGalleryClient, PopupGalleryPhotoRow } from "../types";
import { normalizePopupGalleryPhoto } from "../utils/normalizePopupGallery";

export async function getPopupGalleryPhotos(vendorId: string, supabase: PopupGalleryClient = createSupabaseBrowserClient()) {
  const { data, error } = await supabase
    .from("popup_gallery_photos")
    .select("id, vendor_id, image_url, caption, location, event_name, display_order, created_at, updated_at")
    .eq("vendor_id", vendorId)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((row) => normalizePopupGalleryPhoto(row as PopupGalleryPhotoRow))
}