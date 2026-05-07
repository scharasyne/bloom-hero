"use client";

import { useEffect, useRef, useState } from "react";
import { PopUpMapVendor } from "@/typess";
import PopUpMapSidebar from "./PopUpMapSidebar";
import PopUpVendorModal from "./PopUpVendorModal";

interface PopUpMapProps {
  initialVendors: PopUpMapVendor[];
}

function getToday() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function parseDate(value: string | null | undefined) {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  if (/^\d{4}-\d{2}-\d{2}T/.test(value) || /^\d{4}-\d{2}-\d{2} /.test(value)) return value.slice(0, 10);
  return null;
}

export default function PopUpMap({ initialVendors }: PopUpMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const [activeVendor, setActiveVendor] = useState<PopUpMapVendor | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const today = getToday();

  const matchesSearch = (v: PopUpMapVendor) =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.address.toLowerCase().includes(searchQuery.toLowerCase());

  const todayVendors = initialVendors.filter((v) => {
    const start = parseDate(v.scheduledDate);
    const end = parseDate(v.endRaw);
    if (!start) return false;
    return start <= today && (end === null || end >= today) && matchesSearch(v);
  });

  const upcomingVendors = initialVendors.filter((v) => {
    const start = parseDate(v.scheduledDate);
    if (!start) return false;
    return start > today && matchesSearch(v);
  });

  const handleVendorSelect = (vendor: PopUpMapVendor) => {
    setActiveVendor((current) => (current?.id === vendor.id ? null : vendor));
    const map = mapInstanceRef.current as any;
    if (map) map.setView([vendor.lat, vendor.lng], 17, { animate: true });
  };

  const handleAreaSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1&countrycodes=ph`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        const map = mapInstanceRef.current as any;
        if (map) map.setView([parseFloat(lat), parseFloat(lon)], 15, { animate: true });
      }
    } catch (e) {
      console.error("Nominatim search failed:", e);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (!mapRef.current) return;

    const container = mapRef.current as HTMLDivElement & { _leaflet_id?: number };
    if (container._leaflet_id) {
      (mapInstanceRef.current as any)?.remove();
      mapInstanceRef.current = null;
    }

    import("leaflet").then((L) => {
      if (!mapRef.current) return;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current, {
        center: [10.3203, 123.9012],
        zoom: 14,
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors &nbsp;|&nbsp; Map powered by <a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>',
      }).addTo(map);

      initialVendors.forEach((vendor) => {
        const icon = L.divIcon({
          className: "",
          html: `<div style="
            width:32px;height:32px;
            background:#2f5d3a;border-radius:50%;
            display:flex;align-items:center;justify-content:center;
            color:white;font-weight:700;font-size:12px;
            font-family:var(--font-quicksand),sans-serif;
            box-shadow:0 4px 12px rgba(47,93,58,0.35);
            border:2.5px solid white;
          ">${vendor.displayNumber}</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([vendor.lat, vendor.lng], { icon }).addTo(map);
        marker.on("click", () => handleVendorSelect(vendor));
      });

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as any).remove();
        mapInstanceRef.current = null;
      }
    };
  }, [initialVendors]);

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

      <div className="w-full flex flex-col items-center">

        {/* Section header */}
        <div className="w-full flex flex-col items-center gap-3 py-16 px-6">
          <p className="font-medium text-[#5f6b61] text-[12px] text-center tracking-[2.4px] leading-[22px] uppercase">
            Pop-up Schedule
          </p>
          <h1 className="font-bold text-[#1f1f1f] text-[36px] text-center tracking-[-0.36px] leading-[1.2]">
            Find a Pop-up Near You
          </h1>
          <p className="font-medium text-[#6f6f6f] text-[16px] text-center leading-[1.5] max-w-[560px]">
            Browse scheduled pop-up flower shops around Cebu and see where your
            favorite vendors will be.
          </p>
        </div>

        {/* Map card */}
        <div className="w-full flex justify-center px-6 pb-16 border-b border-[#edeae6]">
          <div
            className="w-full max-w-6xl rounded-[16px] overflow-hidden shadow-[0px_8px_24px_0px_rgba(0,0,0,0.06)]"
            style={{ border: "1px solid #edeae6" }}
          >
            <div className="flex flex-col md:flex-row" style={{ height: "620px" }}>

              <PopUpMapSidebar
                todayVendors={todayVendors}
                upcomingVendors={upcomingVendors}
                activeVendor={activeVendor}
                searchQuery={searchQuery}
                isSearching={isSearching}
                onVendorSelect={handleVendorSelect}
                onSearchChange={setSearchQuery}
                onSearchSubmit={handleAreaSearch}
                onSearchClear={() => setSearchQuery("")}
              />

              {/* Map */}
              <div className="flex-1 min-h-[400px] md:min-h-0 relative">
                <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
                {activeVendor && (
                  <PopUpVendorModal
                    vendor={activeVendor}
                    onClose={() => setActiveVendor(null)}
                  />
                )}
              </div>

            </div>
          </div>
        </div>

      </div>
    </>
  );
}