"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { Icon } from "@iconify/react/dist/iconify.js"
import { Modal } from "@/components/Modal"
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client"
import {
  addPopupGalleryPhoto,
  deletePopupGalleryPhoto,
  PopupGalleryPhoto,
  updatePopupGalleryPhoto,
  uploadPopupGalleryImage,
} from "@/lib/services/popup-gallery"

type PopUpGalleryManagerProps = {
  vendorId: string
  initialPhotos: PopupGalleryPhoto[]
}

type DraftPhotoState = {
  caption: string
  location: string
  eventName: string
}

function sortPhotos(photos: PopupGalleryPhoto[]) {
  return [...photos].sort((left, right) => {
    if (left.displayOrder !== right.displayOrder) {
      return left.displayOrder - right.displayOrder
    }

    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  })
}

export function PopUpGalleryManager({ vendorId, initialPhotos }: PopUpGalleryManagerProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [photos, setPhotos] = useState(() => sortPhotos(initialPhotos))
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null)
  const [draft, setDraft] = useState<DraftPhotoState>({ caption: "", location: "", eventName: "" })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [caption, setCaption] = useState("")
  const [location, setLocation] = useState("")
  const [eventName, setEventName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activePhoto = photos.find((photo) => photo.id === activePhotoId) ?? null

  useEffect(() => {
    setPhotos(sortPhotos(initialPhotos))
  }, [initialPhotos])

  useEffect(() => {
    if (!activePhoto) {
      setDraft({ caption: "", location: "", eventName: "" })
      return
    }

    setDraft({
      caption: activePhoto.caption,
      location: activePhoto.location,
      eventName: activePhoto.eventName,
    })
  }, [activePhoto])

  const handleAddPhoto = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!selectedFile) {
      setError("Choose a photo to upload.")
      return
    }

    if (!caption.trim()) {
      setError("Caption is required.")
      return
    }

    setIsSubmitting(true)

    try {
      const imageUrl = await uploadPopupGalleryImage(selectedFile, vendorId)
      const nextDisplayOrder = photos.length > 0 ? Math.max(...photos.map((photo) => photo.displayOrder)) + 1 : 0

      const insertedPhoto = await addPopupGalleryPhoto(supabase, {
        vendorId,
        imageUrl,
        caption,
        location,
        eventName,
        displayOrder: nextDisplayOrder,
      })

      setPhotos((currentPhotos) => sortPhotos([insertedPhoto, ...currentPhotos]))
      setSelectedFile(null)
      setCaption("")
      setLocation("")
      setEventName("")
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Failed to add gallery photo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSavePhoto = async () => {
    if (!activePhoto) return

    setError(null)
    setIsSaving(true)

    try {
      const updatedPhoto = await updatePopupGalleryPhoto(supabase, activePhoto.id, {
        caption: draft.caption,
        location: draft.location,
        eventName: draft.eventName,
      })

      setPhotos((currentPhotos) =>
        sortPhotos(currentPhotos.map((photo) => (photo.id === updatedPhoto.id ? updatedPhoto : photo)))
      )
      setActivePhotoId(updatedPhoto.id)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to update gallery photo.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeletePhoto = async () => {
    if (!activePhoto) return

    setError(null)
    setIsSaving(true)

    try {
      await deletePopupGalleryPhoto(supabase, activePhoto.id)
      setPhotos((currentPhotos) => currentPhotos.filter((photo) => photo.id !== activePhoto.id))
      setActivePhotoId(null)
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete gallery photo.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[#e8e3dc] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-[18px] font-semibold text-[#1f1f1f]">Add gallery photo</h3>
            <p className="text-[13px] text-[#8b847c]">Upload a new bouquet image and fill in the details.</p>
          </div>
          <span className="text-[12px] font-medium text-[#2f5d3a]">
            {photos.length} photo{photos.length === 1 ? "" : "s"}
          </span>
        </div>

        <form className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_1fr]" onSubmit={handleAddPhoto}>
          <label className="flex flex-col gap-2 rounded-2xl border border-dashed border-[#d8d0c7] bg-[#faf8f5] px-4 py-4 text-sm text-[#4c4742]">
            <span className="text-[12px] font-semibold uppercase tracking-wide text-[#8b847c]">Photo file</span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              className="text-sm file:mr-4 file:rounded-full file:border-0 file:bg-[#2f5d3a] file:px-4 file:py-2 file:text-white file:text-xs file:font-semibold"
            />
            <span className="text-xs text-[#8b847c]">JPG, PNG, or WebP.</span>
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                label: "Caption",
                value: caption,
                onChange: setCaption,
                placeholder: "Spring bouquet at the plaza",
                span: true,
              },
              {
                label: "Location",
                value: location,
                onChange: setLocation,
                placeholder: "Cebu City",
              },
              {
                label: "Event",
                value: eventName,
                onChange: setEventName,
                placeholder: "Sunday market",
              },
            ].map((field) => (
              <label key={field.label} className={field.span ? "sm:col-span-2 flex flex-col gap-2" : "flex flex-col gap-2"}>
                <span className="text-[12px] font-semibold uppercase tracking-wide text-[#8b847c]">{field.label}</span>
                <input
                  type="text"
                  value={field.value}
                  onChange={(event) => field.onChange(event.target.value)}
                  placeholder={field.placeholder}
                  className="rounded-xl border border-[#d6d0c8] bg-[#faf8f5] px-3 py-2 text-[14px] text-[#1f1f1f] outline-none transition focus:border-[#2f5d3a] focus:bg-white"
                />
              </label>
            ))}

            <button
              type="submit"
              disabled={isSubmitting}
              className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-full bg-[#d24b46] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#b83d39] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Icon icon="mdi:image-plus-outline" width={16} height={16} />
              {isSubmitting ? "Uploading..." : "Add to gallery"}
            </button>
          </div>
        </form>

        {error ? <p className="mt-3 text-sm text-[#b83d39]">{error}</p> : null}
      </div>

      {photos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#d8d0c7] px-5 py-7 text-sm text-[#7a746e]">
          No gallery photos yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {photos.map((photo) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setActivePhotoId(photo.id)}
              className="group overflow-hidden rounded-2xl border border-[#ece5dd] bg-[#faf8f5] text-left shadow-[0_4px_18px_rgba(0,0,0,0.05)] transition hover:-translate-y-0.5"
            >
              <div className="relative h-56 w-full bg-[#e8dfd5]">
                <img
                  src={photo.imageUrl}
                  alt={photo.caption}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
              </div>

              <div className="space-y-1 px-4 pb-4 pt-3">
                <h4 className="line-clamp-1 text-[16px] font-semibold text-[#2a2724]">{photo.caption}</h4>
                <p className="text-[13px] text-[#80786f]">{photo.location}</p>
                <p className="text-[13px] text-[#80786f]">{photo.eventName}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      <Modal isOpen={Boolean(activePhoto)} onCloseAction={() => setActivePhotoId(null)}>
        {activePhoto ? (
          <div className="space-y-5">
            <div className="overflow-hidden rounded-2xl bg-[#e8dfd5]">
              <img src={activePhoto.imageUrl} alt={activePhoto.caption} className="max-h-105 w-full object-cover" />
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-wide text-[#8b847c]">Caption</p>
                <input
                  value={draft.caption}
                  onChange={(event) => setDraft((currentDraft) => ({ ...currentDraft, caption: event.target.value }))}
                  className="mt-2 w-full rounded-xl border border-[#d6d0c8] px-3 py-2 text-sm outline-none focus:border-[#2f5d3a]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-[12px] font-semibold uppercase tracking-wide text-[#8b847c]">Location</span>
                  <input
                    value={draft.location}
                    onChange={(event) => setDraft((currentDraft) => ({ ...currentDraft, location: event.target.value }))}
                    className="rounded-xl border border-[#d6d0c8] px-3 py-2 text-sm outline-none focus:border-[#2f5d3a]"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-[12px] font-semibold uppercase tracking-wide text-[#8b847c]">Event</span>
                  <input
                    value={draft.eventName}
                    onChange={(event) => setDraft((currentDraft) => ({ ...currentDraft, eventName: event.target.value }))}
                    className="rounded-xl border border-[#d6d0c8] px-3 py-2 text-sm outline-none focus:border-[#2f5d3a]"
                  />
                </label>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleSavePhoto}
                  disabled={isSaving}
                  className="inline-flex items-center justify-center rounded-full bg-[#2f5d3a] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#254a2f] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSaving ? "Saving..." : "Update photo"}
                </button>
                <button
                  type="button"
                  onClick={handleDeletePhoto}
                  disabled={isSaving}
                  className="inline-flex items-center justify-center rounded-full border border-[#e0d8cf] px-4 py-3 text-sm font-semibold text-[#b83d39] transition hover:bg-[#fff4f3] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Delete photo
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}