import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client"

const POPUP_GALLERY_BUCKET = "popup-gallery-images"

export type PopupGalleryPhotoRow = {
  id: string
  vendor_id: string
  image_url: string
  caption: string
  location: string | null
  event_name: string | null
  display_order: number
  created_at: string
  updated_at: string | null
}

export type PopupGalleryPhoto = {
  id: string
  vendorId: string
  imageUrl: string
  caption: string
  location: string
  eventName: string
  displayOrder: number
  createdAt: string
  updatedAt: string | null
}

export type PopupGalleryPhotoInput = {
  vendorId: string
  imageUrl: string
  caption: string
  location?: string
  eventName?: string
  displayOrder?: number
}

export type PopupGalleryPhotoUpdate = {
  caption?: string
  location?: string
  eventName?: string
  imageUrl?: string
  displayOrder?: number
}

export type PopupGalleryClient = ReturnType<typeof createSupabaseBrowserClient>

function normalizeText(value: string | null | undefined, fallback = "") {
  const trimmed = value?.trim()
  return trimmed && trimmed.length > 0 ? trimmed : fallback
}

export function normalizePopupGalleryPhoto(row: PopupGalleryPhotoRow): PopupGalleryPhoto {
  return {
    id: row.id,
    vendorId: row.vendor_id,
    imageUrl: row.image_url,
    caption: normalizeText(row.caption, "Untitled photo"),
    location: normalizeText(row.location, "Location pending"),
    eventName: normalizeText(row.event_name, "Event pending"),
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

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

export async function deletePopupGalleryPhoto(supabase: PopupGalleryClient, photoId: string) {
  const { error } = await supabase.from("popup_gallery_photos").delete().eq("id", photoId)

  if (error) {
    throw new Error(error.message)
  }
}

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