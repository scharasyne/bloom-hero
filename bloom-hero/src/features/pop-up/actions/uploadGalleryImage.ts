import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

const POPUP_GALLERY_BUCKET = "popup-gallery-images"

export async function uploadPopupGalleryImage(file: File, vendorId: string) {
  const supabase = createSupabaseBrowserClient()
  const fileParts = file.name.split(".")
  const fileExtension = fileParts.length > 1 ? fileParts.pop() : "jpg"
  const filePath = `${vendorId}/${crypto.randomUUID()}.${fileExtension || "jpg"}`

  const { error: uploadError } = await supabase.storage
    .from(POPUP_GALLERY_BUCKET)
    .upload(filePath, file, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    })

  if (uploadError) {
    throw new Error(uploadError.message)
  }

  const { data } = supabase.storage.from(POPUP_GALLERY_BUCKET).getPublicUrl(filePath)
  return data.publicUrl
}