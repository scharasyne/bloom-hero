import { PopupGalleryClient } from "../types";

export async function deletePopupGalleryPhoto(supabase: PopupGalleryClient, photoId: string) {
  const { error } = await supabase.from("popup_gallery_photos").delete().eq("id", photoId)

  if (error) {
    throw new Error(error.message)
  }
}