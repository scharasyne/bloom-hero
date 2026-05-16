import { PopupGalleryPhoto, PopupGalleryPhotoRow } from "../types";

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
