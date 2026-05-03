"use client";

import { useEffect, useRef, useState } from "react";
import { PopUpMapVendor } from "@/typess";

interface PopUpMapProps {
  initialVendors: PopUpMapVendor[];
}

export default function PopUpMap({ initialVendors }: PopUpMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const vendors = initialVendors;
  const [activeVendor, setActiveVendor] = useState<string | null>(null);

  const handleVendorSelect = (vendor: PopUpMapVendor) => {
    setActiveVendor((current) => (current === vendor.id ? null : vendor.id));

    const map = mapInstanceRef.current as any;
    if (map) {
      map.setView([vendor.lat, vendor.lng], 17, { animate: true });
    }
  };

  useEffect(() => {
    if (!mapRef.current) return;

    const container = mapRef.current as HTMLDivElement & {
      _leaflet_id?: number;
    };
    if (container._leaflet_id) {
      (mapInstanceRef.current as any)?.remove();
      mapInstanceRef.current = null;
    }

    import("leaflet").then((L) => {
      if (!mapRef.current) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors &nbsp;|&nbsp; <a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>',
      }).addTo(map);

      vendors.forEach((vendor) => {
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
  }, [vendors]);

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

      <div className="flex flex-col gap-8 items-center justify-center py-8 md:py-16 w-full border-b border-[#edeae6]">

        {/* ── Section header — mirrors BestSellers style ── */}
        <div className="flex flex-col items-center gap-3 text-center px-6">
          <p className="font-medium text-[#8f8f8f] text-[12px] tracking-[1.2px]">POP-UP SCHEDULE</p>
          <p className="font-semibold text-[#1f1f1f] text-[24px] md:text-[32px] tracking-[1.28px] leading-[1.2]">
            Find a Pop-up Near You
          </p>
          <p className="font-normal text-[#7a7a7a] text-[16px] max-w-lg">
            Browse scheduled pop-up flower shops around Cebu and see where your favorite vendors will be.
          </p>
        </div>

        {/* ── Map card ── */}
        <div className="w-full flex justify-center px-4 md:px-8">
          <div className="w-full max-w-6xl rounded-2xl overflow-hidden border border-[#e0dbd3] shadow-[0_8px_40px_-8px_rgba(0,0,0,0.1)]">
            <div className="flex flex-col md:flex-row" style={{ height: "600px" }}>

              {/* ── Sidebar ── */}
              <div className="w-full md:w-[300px] flex-shrink-0 flex flex-col bg-[#fdfaf7] border-b md:border-b-0 md:border-r border-[#e8e2da]">

                {/* Sidebar header */}
                <div className="px-5 pt-5 pb-4 border-b border-[#ede9e2]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2f5d3a] animate-pulse" />
                      <p className="font-bold text-[#1f1f1f] text-[13px] tracking-[0.5px] uppercase">
                        Active Pop-ups
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-[#7a7a7a] bg-[#f0ece6] px-2 py-0.5 rounded-full">
                      {vendors.length} {vendors.length === 1 ? "location" : "locations"}
                    </span>
                  </div>
                </div>

                {/* Vendor list */}
                <div className="flex-1 overflow-y-auto py-2 px-2">
                  {vendors.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-center px-4">
                      <p className="text-[13px] font-medium text-[#a09a94]">
                        No pop-up locations available right now.
                      </p>
                    </div>
                  )}
                  {vendors.map((vendor) => (
                    <button
                      key={vendor.id}
                      onClick={() => handleVendorSelect(vendor)}
                      className={`w-full text-left px-3 py-3 rounded-xl transition-all duration-150 group ${
                        activeVendor === vendor.id
                          ? "bg-[#eef4f0] border border-[#cce0d4]"
                          : "hover:bg-[#f5f1ec] border border-transparent"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`flex-shrink-0 mt-0.5 w-6 h-6 rounded-full text-white text-[11px] font-bold flex items-center justify-center transition-colors ${
                            activeVendor === vendor.id
                              ? "bg-[#2f5d3a]"
                              : "bg-[#a0b8a8] group-hover:bg-[#2f5d3a]"
                          }`}
                        >
                          {vendor.displayNumber}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-[#1f1f1f] text-[13px] leading-snug truncate">
                            {vendor.name}
                          </p>
                          <p className="font-medium text-[#9a9490] text-[11px] mt-0.5 leading-snug truncate">
                            {vendor.address}
                          </p>
                          <p className="text-[#b0a9a3] text-[11px] mt-1 font-medium">
                            {vendor.startDate} – {vendor.endDate}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* CTA — red, matching original */}
                <div className="px-4 py-4 border-t border-[#ede9e2] flex-shrink-0">
                  <button className="w-full h-10 rounded-xl bg-[#d24b46] text-white font-semibold text-[13px] tracking-[0.3px] hover:bg-[#b93e3a] active:scale-[0.98] transition-all duration-150 shadow-sm shadow-[#d24b46]/20">
                    Request a Pop-up
                  </button>
                </div>
              </div>

              {/* ── Map ── */}
              <div className="flex-1 min-h-[400px] md:min-h-0">
                <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
              </div>

            </div>
          </div>
        </div>

      </div>
    </>
  );
}