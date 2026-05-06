"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Icon } from "@iconify/react";
import { X } from "lucide-react";
import type { RequestedLocationRank } from "@/lib/vendors/vendor-actions";
import type { LeafletMouseEvent, Map as LeafletMap, Marker as LeafletMarker } from "leaflet";

type UpcomingPopUp = {
  id: string;
  location: string;
  scheduled_date: string;
  start_time: string | null;
  end_time: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

type CreateScheduleInput = {
  vendorId: string;
  location: string;
  scheduledDate: string;
  startTime?: string | null;
  endTime?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  landmark?: string | null;
};

export default function PopUpScheduleClient({
  vendorId,
  topRequested,
  ranking,
  initialUpcoming,
  createScheduleAction,
}: {
  vendorId: string;
  topRequested: RequestedLocationRank[];
  ranking: RequestedLocationRank[];
  initialUpcoming: UpcomingPopUp[];
  createScheduleAction: (input: CreateScheduleInput) => Promise<{ success: boolean; error?: string; data?: UpcomingPopUp }>;
}) {
  const leafletRef = useRef<(typeof import("leaflet")) | null>(null);
  const [showRanking, setShowRanking] = useState(false);
  const [showNewSchedule, setShowNewSchedule] = useState(false);
  const [upcoming, setUpcoming] = useState(initialUpcoming);
  const [location, setLocation] = useState("");
  const [landmark, setLandmark] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPin, setSelectedPin] = useState<{ lat: number; lng: number } | null>(null);
  const [isSaving, startSaving] = useTransition();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);

  const sortedUpcoming = useMemo(
    () =>
      [...upcoming].sort((a, b) => {
        const aTime = new Date(a.start_time || a.scheduled_date).getTime();
        const bTime = new Date(b.start_time || b.scheduled_date).getTime();
        return aTime - bTime;
      }),
    [upcoming]
  );

  const formatTime = (time: string | null) => {
    if (!time) return "TBA";
    const source = time.includes("T")
      ? new Date(time).toTimeString().slice(0, 5)
      : time.slice(0, 5);
    const [h, m] = source.split(":");
    const hour = Number(h);
    const min = m ?? "00";
    const ampm = hour >= 12 ? "PM" : "AM";
    return `${hour % 12 || 12}:${min} ${ampm}`;
  };

  const formatDateParts = (date: string) => {
    const d = new Date(date);
    return {
      month: d.toLocaleDateString("en-US", { month: "short" }),
      day: d.getDate(),
    };
  };

  const setMapPin = (lat: number, lng: number, name: string, map?: LeafletMap) => {
    const leaflet = leafletRef.current;
    if (!leaflet) return;
    const activeMap = map ?? mapInstanceRef.current;
    if (!activeMap) return;
    if (markerRef.current) activeMap.removeLayer(markerRef.current);
    markerRef.current = leaflet.marker([lat, lng]).addTo(activeMap);
    activeMap.setView([lat, lng], 16, { animate: true });
    markerRef.current.bindPopup(name).openPopup();
    setSelectedPin({ lat, lng });
    setLocation(name);
  };

  useEffect(() => {
    if (!showNewSchedule || !mapRef.current) return;
    let map: LeafletMap | null = null;
    let resizeTimer: number | null = null;
    let cancelled = false;
    let onClick: ((e: LeafletMouseEvent) => Promise<void>) | null = null;

    const init = async () => {
      const leafletModule = await import("leaflet");
      const leaflet = (leafletModule.default ?? leafletModule) as typeof import("leaflet");
      if (cancelled || !mapRef.current) return;
      leafletRef.current = leaflet;

      map = leaflet.map(mapRef.current).setView([10.3157, 123.8854], 13);
      mapInstanceRef.current = map;
      leaflet
        .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
          maxZoom: 19,
        })
        .addTo(map);

      resizeTimer = window.setTimeout(() => map?.invalidateSize(), 120);
      onClick = async (e: LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await response.json();
          setMapPin(lat, lng, data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`, map || undefined);
        } catch {
          setMapPin(lat, lng, `${lat.toFixed(5)}, ${lng.toFixed(5)}`, map || undefined);
        }
      };

      map.on("click", onClick);
    };

    void init();
    return () => {
      cancelled = true;
      if (resizeTimer) window.clearTimeout(resizeTimer);
      if (map && onClick) map.off("click", onClick);
      map?.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, [showNewSchedule]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const term = location.trim();
    if (!term) return;
    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(term)}&limit=1`
      );
      const data = (await response.json()) as { lat: string; lon: string; display_name: string }[];
      const top = data?.[0];
      if (!top) return;
      setMapPin(Number(top.lat), Number(top.lon), top.display_name);
    } finally {
      setSearching(false);
    }
  };

  const handleSaveSchedule = () => {
    setError(null);
    if (!location.trim() || !scheduledDate) {
      setError("Location and date are required.");
      return;
    }
    startSaving(async () => {
      const result = await createScheduleAction({
        vendorId,
        location: location.trim(),
        scheduledDate,
        startTime: startTime || null,
        endTime: endTime || null,
        latitude: selectedPin?.lat ?? null,
        longitude: selectedPin?.lng ?? null,
        landmark: landmark || null,
      });
      if (!result.success || !result.data) {
        setError(result.error || "Failed to add schedule.");
        return;
      }
      setUpcoming((prev) => [result.data!, ...prev]);
      setShowNewSchedule(false);
      setLocation("");
      setLandmark("");
      setScheduledDate("");
      setStartTime("");
      setEndTime("");
      setSelectedPin(null);
    });
  };

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-[-0.64px] text-[#1f1f1f]">Pop Ups</h1>
          <p className="mt-1 text-[15px] font-medium text-[#6f6a65]">Manage your schedules and view customer requests</p>
        </div>
        <button onClick={() => setShowNewSchedule(true)} className="mr-1 flex items-center gap-2 rounded-2xl bg-[#2f5d3a] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#264d30]">
          <Icon icon="mdi:plus" width={18} height={18} />
          New Schedule
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 flex flex-col gap-6 lg:col-span-7">
          <section className="rounded-4xl border border-[#edeae6] bg-white p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-[17px] font-bold text-[#1f1f1f]">Most Requested</h2>
              <button onClick={() => setShowRanking(true)} className="text-sm font-semibold text-[#2f5d3a] hover:underline">View All</button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {topRequested.length === 0 ? <p className="col-span-2 py-8 text-center text-sm font-medium text-[#7a7a7a]">No requests yet this month.</p> : topRequested.map((item) => (
                <div key={item.location} className="flex items-center justify-between rounded-[14px] border border-[#d6d0c8] bg-white p-4">
                  <p className="text-lg font-bold text-[#1f1f1f]">{item.location}</p>
                  <p className="text-2xl font-black leading-none text-[#2f5d3a]">{item.count}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="col-span-12 lg:col-span-5">
          <section className="flex h-full flex-col rounded-4xl border border-[#edeae6] bg-white p-6">
            <h2 className="mb-5 text-[17px] font-bold text-[#1f1f1f]">Upcoming Pop Ups</h2>
            <div className="flex flex-1 flex-col gap-3">
              {sortedUpcoming.length === 0 ? <p className="py-8 text-center text-sm font-medium text-[#7a7a7a]">No upcoming events scheduled.</p> : sortedUpcoming.map((event) => {
                const date = formatDateParts(event.scheduled_date);
                return (
                  <div key={event.id} className="flex gap-3">
                    <div className="flex h-18 min-w-15 flex-col items-center justify-center rounded-[14px] border border-[#d6d0c8] bg-white">
                      <span className="text-[10px] font-bold text-[#7a7a7a]">{date.month}</span>
                      <span className="text-2xl font-black leading-none text-[#1f1f1f]">{date.day}</span>
                    </div>
                    <div className="flex-1 rounded-[14px] border border-[#d6d0c8] bg-white p-4">
                      <p className="text-sm font-bold text-[#1f1f1f]">{event.location}</p>
                      <p className="mt-1 text-[11px] text-[#6f6a65]">{formatTime(event.start_time)}{event.end_time ? ` - ${formatTime(event.end_time)}` : ""}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      {showRanking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#1f1f1f]">Location Request Ranking</h3>
              <button onClick={() => setShowRanking(false)}><X size={18} /></button>
            </div>
            <div className="max-h-96 space-y-2 overflow-y-auto">
              {ranking.length === 0 ? <p className="py-8 text-center text-sm text-[#7a7a7a]">No ranking yet.</p> : ranking.map((item, idx) => (
                <div key={item.location} className="flex items-center justify-between rounded-xl border border-[#ece5dd] px-4 py-3">
                  <p className="text-sm font-medium text-[#2a2724]">#{idx + 1} {item.location}</p>
                  <p className="text-sm font-bold text-[#2f5d3a]">{item.count}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showNewSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[92vh] w-full max-w-3xl flex-col rounded-2xl bg-white">
            <div className="flex items-center justify-between border-b border-[#ece4dc] px-6 py-4">
              <h3 className="text-lg font-semibold text-[#2c2825]">New Schedule</h3>
              <button onClick={() => setShowNewSchedule(false)}><X size={20} /></button>
            </div>
            <div className="space-y-4 overflow-y-auto p-6">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Search location" className="w-full rounded-xl border border-[#e0d8cf] px-3 py-2 text-sm outline-none focus:border-[#2f5d3a]" />
                <button type="submit" disabled={searching} className="rounded-xl bg-[#2f5d3a] px-4 py-2 text-sm font-semibold text-white">{searching ? "..." : "Search"}</button>
              </form>
              <div ref={mapRef} className="h-72 w-full rounded-xl border border-[#ece5dd]" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="rounded-xl border border-[#e0d8cf] px-3 py-2 text-sm" />
                <input value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder="Landmark (optional)" className="rounded-xl border border-[#e0d8cf] px-3 py-2 text-sm" />
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="rounded-xl border border-[#e0d8cf] px-3 py-2 text-sm" />
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="rounded-xl border border-[#e0d8cf] px-3 py-2 text-sm" />
              </div>
              {error && <p className="text-sm text-[#d24b46]">{error}</p>}
            </div>
            <div className="flex justify-end gap-2 border-t border-[#ece4dc] px-6 py-4">
              <button onClick={() => setShowNewSchedule(false)} className="rounded-full border border-[#e0d8cf] px-4 py-2 text-sm">Cancel</button>
              <button onClick={handleSaveSchedule} disabled={isSaving} className="rounded-full bg-[#2f5d3a] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{isSaving ? "Saving..." : "Save Schedule"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
