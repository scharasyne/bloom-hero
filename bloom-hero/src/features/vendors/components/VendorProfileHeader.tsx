"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Modal } from "@/components/Modal";

import type { VendorCommonProfile } from "../types";
import { updateVendorCommonProfileByOwner } from "../actions/update-current-vendor-profile";

type Props = {
  profile: VendorCommonProfile;
  previewHref?: string;
};

function getShopInitial(name: string) {
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed.charAt(0).toUpperCase() : "?";
}

export function VendorProfileHeader({ profile, previewHref }: Props) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    shopName: profile.shopName,
    profilePhotoUrl: profile.profilePhotoUrl || "",
    location: profile.location,
    phoneNumber: profile.phoneNumber,
    scheduleStart: profile.scheduleStart,
    scheduleEnd: profile.scheduleEnd,
    about: profile.about,
  });

  const saveProfile = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await updateVendorCommonProfileByOwner({
        businessType: profile.businessType,
        vendorId: profile.vendorId,
        shopName: draft.shopName,
        profilePhotoUrl: draft.profilePhotoUrl || null,
        location: draft.location,
        phoneNumber: draft.phoneNumber,
        scheduleStart: draft.scheduleStart || undefined,
        scheduleEnd: draft.scheduleEnd || undefined,
        about: draft.about,
      });

      if (!result.ok) {
        setMessage(result.error ?? "Failed to save profile.");
        return;
      }

      setIsModalOpen(false);
      router.refresh();
    });
  };

  const handlePhotoUpload = async (file: File) => {
    setMessage(null);
    setIsUploadingPhoto(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/profile-photo-upload", {
        method: "POST",
        body: form,
      });
      const result = (await response.json()) as { success: boolean; url?: string; error?: string };
      if (!response.ok || !result.success || !result.url) {
        setMessage(result.error ?? "Photo upload failed.");
        return;
      }
      setDraft((prev) => ({ ...prev, profilePhotoUrl: result.url! }));
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  return (
    <div className="rounded-3xl border border-[#ebe5de] bg-[#fbf9f6] px-5 py-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:px-6 sm:py-7 lg:px-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4 sm:gap-6">
          {profile.profilePhotoUrl ? (
            <img
              src={profile.profilePhotoUrl}
              alt={profile.shopName}
              className="h-20 w-20 rounded-2xl object-cover sm:h-24 sm:w-24"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#d9e7da] text-3xl font-bold text-[#2f5d3a] sm:h-24 sm:w-24 sm:text-4xl">
              {getShopInitial(profile.shopName)}
            </div>
          )}

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#2c2825] sm:text-[26px]">
              {profile.shopName}
            </h1>
            <p className="mt-1 text-sm text-[#8a847d]">
              {profile.location || "Location not set yet."}
            </p>

            <div className="mt-3 flex flex-wrap gap-4 text-xs text-[#8a847d] sm:text-[13px]">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2f5d3a]" />
                <span>{profile.phoneNumber || "Phone number not set"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#f5ad2e]" />
                <span>{profile.scheduleLabel}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 sm:gap-3">
          {previewHref ? (
            <Link
              href={previewHref}
              className="inline-flex h-10 items-center justify-center rounded-full border border-[#e0d8cf] px-4 text-xs font-medium text-[#4a453f] hover:bg-[#f3eee8]"
            >
              Preview as customer
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex h-10 items-center justify-center rounded-full bg-[#2f5d3a] px-4 text-xs font-semibold text-white shadow-[0_8px_20px_rgba(25,118,72,0.28)] hover:bg-[#254a2f]"
          >
            Edit profile
          </button>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onCloseAction={() => setIsModalOpen(false)}>
        <div className="space-y-3 pt-5">
          <h3 className="text-sm font-semibold text-[#2c2825]">Edit profile</h3>
          <input
            type="text"
            value={draft.shopName}
            onChange={(event) => setDraft((prev) => ({ ...prev, shopName: event.target.value }))}
            placeholder="Shop name"
            className="w-full rounded-xl border border-[#d9d2ca] px-3 py-2 text-sm"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) handlePhotoUpload(file);
            }}
            className="w-full rounded-xl border border-[#d9d2ca] px-3 py-2 text-sm"
          />
          {draft.profilePhotoUrl ? (
            <img
              src={draft.profilePhotoUrl}
              alt="Uploaded profile preview"
              className="h-20 w-20 rounded-xl object-cover"
            />
          ) : null}
          {isUploadingPhoto ? <p className="text-xs text-[#6f6a65]">Uploading photo...</p> : null}
          <input
            type="text"
            value={draft.location}
            onChange={(event) => setDraft((prev) => ({ ...prev, location: event.target.value }))}
            placeholder="Location"
            className="w-full rounded-xl border border-[#d9d2ca] px-3 py-2 text-sm"
          />
          <Link href="/map" className="inline-flex text-xs text-[#2f5d3a] hover:underline">
            Lookup location on map
          </Link>
          <input
            type="text"
            value={draft.phoneNumber}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, phoneNumber: event.target.value }))
            }
            placeholder="+63XXXXXXXXX"
            className="w-full rounded-xl border border-[#d9d2ca] px-3 py-2 text-sm"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="time"
              value={draft.scheduleStart}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, scheduleStart: event.target.value }))
              }
              className="w-full rounded-xl border border-[#d9d2ca] px-3 py-2 text-sm"
            />
            <input
              type="time"
              value={draft.scheduleEnd}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, scheduleEnd: event.target.value }))
              }
              className="w-full rounded-xl border border-[#d9d2ca] px-3 py-2 text-sm"
            />
          </div>
          <textarea
            value={draft.about}
            onChange={(event) => setDraft((prev) => ({ ...prev, about: event.target.value }))}
            placeholder="About your shop"
            rows={4}
            className="w-full rounded-xl border border-[#d9d2ca] px-3 py-2 text-sm"
          />
          {message ? <p className="text-xs text-[#b03030]">{message}</p> : null}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              disabled={isPending}
              onClick={saveProfile}
              className="inline-flex h-9 items-center justify-center rounded-full bg-[#2f5d3a] px-4 text-xs font-semibold text-white disabled:opacity-60"
            >
              {isPending ? "Saving..." : "Save changes"}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="inline-flex h-9 items-center justify-center rounded-full border border-[#d9d2ca] px-4 text-xs font-semibold text-[#4a453f]"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
