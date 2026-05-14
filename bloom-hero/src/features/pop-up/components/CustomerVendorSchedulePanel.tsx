// Source: src/app/(vendor)/_components/CustomerVendorSchedulePanel.tsx

"use client";

import { useState } from "react";

interface PopUpScheduleItem {
  location: string;
  scheduled_date: string;
  start_time?: string | null;
  end_time?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

interface CustomerVendorSchedulePanelProps {
  schedule: PopUpScheduleItem[];
  vendorName: string;
}

export default function CustomerVendorSchedulePanel({
  schedule,
}: CustomerVendorSchedulePanelProps) {
  const [selectedMap, setSelectedMap] = useState<{
    location: string;
    latitude?: number | null;
    longitude?: number | null;
  } | null>(null);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const formatDateParts = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
      day: date.getDate(),
    };
  };

  const formatTime = (timeStr?: string | null) => {
    if (!timeStr) return "";
    const parsed = new Date(timeStr);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleTimeString("en-PH", {
        hour: "numeric",
        minute: "2-digit",
      });
    }
    const match = timeStr.match(/(\d{2}):(\d{2})/);
    if (!match) return "";
    const hour = Number(match[1]);
    const minute = match[2];
    const ampm = hour >= 12 ? "PM" : "AM";
    return `${hour % 12 || 12}:${minute} ${ampm}`;
  };

  const toPinnedLocation = (rawLocation: string) => {
    const normalized = (rawLocation || "").trim();
    if (!normalized) return "Location";
    const noLandmark = normalized.split(" - ")[0]?.trim() || normalized;
    const firstPart = noLandmark.split(",")[0]?.trim() || noLandmark;
    return firstPart
      .replace(/^barangay\s+/i, "")
      .replace(/^brgy\.?\s+/i, "")
      .trim();
  };

  const getMapEmbedUrl = (item: {
    location: string;
    latitude?: number | null;
    longitude?: number | null;
  }) => {
    if (typeof item.latitude === "number" && typeof item.longitude === "number") {
      return `https://maps.google.com/maps?q=${item.latitude},${item.longitude}&z=15&output=embed`;
    }
    return `https://maps.google.com/maps?q=${encodeURIComponent(item.location)}&z=15&output=embed`;
  };

  return (
    <div className="rounded-3xl border border-[#ebe5de] bg-[#fbf9f6] px-5 py-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:px-6 sm:py-7 lg:px-8">
      <h2 className="mb-6 text-lg font-semibold tracking-tight text-[#262321]">
        Pop-up Schedule
      </h2>

      {schedule.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#d8d0c7] bg-[#fbf8f4] px-5 py-7 text-sm text-[#7a746e]">
          <p className="font-medium text-[#4a453f]">
            No upcoming pop-ups scheduled.
          </p>
          <p className="mt-1">Check back soon for new dates!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {schedule.map((item) => {
            const location = toPinnedLocation(item.location || "");
            const date = formatDateParts(item.scheduled_date);
            return (
            <div
              key={`${item.scheduled_date}-${item.start_time ?? "na"}-${item.location}`}
              className="flex items-center gap-4 rounded-2xl border border-[#ece5dd] bg-white px-4 py-4 hover:border-[#d2cbc3]"
            >
              <div className="flex h-16 min-w-16 flex-col items-center justify-center rounded-[14px] border border-[#d6d0c8] bg-white">
                <span className="text-[10px] font-bold text-[#7a7a7a]">{date.month}</span>
                <span className="text-2xl font-black leading-none text-[#1f1f1f]">{date.day}</span>
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold text-[#2c2825]">{location}</p>
                {(item.start_time || item.end_time) ? (
                  <p className="mt-1 text-xs text-[#6f6a65]">
                    {item.start_time ? formatTime(item.start_time) : "--:--"}
                    {" - "}
                    {item.end_time ? formatTime(item.end_time) : "--:--"}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-[#6f6a65]">Time not set</p>
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedMap({
                    location: item.location || "Location not set",
                    latitude: item.latitude ?? null,
                    longitude: item.longitude ?? null,
                  })
                }
                className="rounded-full border border-[#e0d8cf] px-3 py-1.5 text-xs font-medium text-[#4a453f] hover:bg-[#f3eee8]"
              >
                View location in map
              </button>
            </div>
          )})}
        </div>
      )}

      {selectedMap ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6"
          onClick={() => setSelectedMap(null)}
        >
          <div
            className="w-full max-w-3xl rounded-2xl bg-white p-4 shadow-[0_20px_70px_rgba(15,23,42,0.35)] sm:p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#2a2724]">{selectedMap.location}</h3>
              <button
                type="button"
                onClick={() => setSelectedMap(null)}
                className="rounded-full border border-[#e7dfd7] px-2.5 py-1 text-xs font-semibold text-[#6f6a65] hover:bg-[#f3eee8]"
              >
                Close
              </button>
            </div>
            <div className="h-[380px] overflow-hidden rounded-xl border border-[#ece5dd]">
              <iframe
                title="Pop-up location map"
                src={getMapEmbedUrl(selectedMap)}
                className="h-full w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}