"use client";

import { useEffect, useRef, useState } from "react";
import { X, MapPin, Calendar, User } from "lucide-react";
import { PopUpMapVendor } from "@/typess";

interface PopUpMapProps {
  initialVendors: PopUpMapVendor[];
}

export default function PopUpMap({ initialVendors }: PopUpMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const vendors = initialVendors;
  const [activeVendor, setActiveVendor] = useState<PopUpMapVendor | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleVendorSelect = (vendor: PopUpMapVendor) => {
    setActiveVendor((current) => (current?.id === vendor.id ? null : vendor));
    const map = mapInstanceRef.current as any;
    if (map) {
      map.setView([vendor.lat, vendor.lng], 17, { animate: true });
    }
  };

  // Filter sidebar list by search query
  const filteredVendors = vendors.filter(
    (v) =>
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      <div className="w-full flex flex-col items-center">

        {/* ── Section header ── */}
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

        {/* ── Map section ── */}
        <div className="w-full flex justify-center px-6 pb-16 border-b border-[#edeae6]">
          <div
            className="w-full max-w-6xl rounded-[16px] overflow-hidden shadow-[0px_8px_24px_0px_rgba(0,0,0,0.06)]"
            style={{ border: "1px solid #edeae6" }}
          >
            <div className="flex flex-col md:flex-row" style={{ height: "620px" }}>

              {/* ── Sidebar ── */}
              <div
                className="w-full md:w-[300px] flex-shrink-0 flex flex-col border-b md:border-b-0 md:border-r border-[#edeae6]"
                style={{ background: "#fdfaf7" }}
              >
                {/* Header */}
                <div className="px-4 pt-4 pb-3 border-b border-[#ede9e2]">
                  <div className="flex items-center justify-between mb-3">
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

                  {/* Search */}
                  <div className="relative">
                    <MapPin size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#a0a0a0]" />
                    <input
                      type="text"
                      placeholder="Search by name or area..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-7 pr-7 py-2 text-[12px] rounded-lg bg-[#f0ece6] border border-transparent focus:border-[#c8dfd0] focus:outline-none placeholder-[#b0a9a3] text-[#1f1f1f] transition-colors"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#c8c0b8] hover:bg-[#a09890] flex items-center justify-center transition-colors"
                      >
                        <X size={8} className="text-white" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Vendor list — name only */}
                <div className="flex-1 overflow-y-auto py-2 px-2">
                  {filteredVendors.length === 0 && (
                    <p className="px-3 py-2 text-[12px] text-[#7a7a7a]">No results found.</p>
                  )}
                  {filteredVendors.map((vendor) => (
                    <button
                      key={vendor.id}
                      onClick={() => handleVendorSelect(vendor)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-150 group ${
                        activeVendor?.id === vendor.id
                          ? "bg-[#eef4f0] border border-[#cce0d4]"
                          : "hover:bg-[#f5f1ec] border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex-shrink-0 w-6 h-6 rounded-full text-white text-[11px] font-bold flex items-center justify-center transition-colors ${
                            activeVendor?.id === vendor.id
                              ? "bg-[#2f5d3a]"
                              : "bg-[#a0b8a8] group-hover:bg-[#2f5d3a]"
                          }`}
                        >
                          {vendor.displayNumber}
                        </span>
                        <p className="font-semibold text-[#1f1f1f] text-[13px] leading-snug truncate">
                          {vendor.name}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Request Pop-up Button */}
                <div className="px-4 py-4 border-t border-[#edeae6] flex-shrink-0">
                  <button className="w-full h-10 rounded-xl bg-[#d24b46] text-white font-semibold text-[13px] tracking-[0.3px] hover:bg-[#b93e3a] active:scale-[0.98] transition-all duration-150 shadow-sm shadow-[#d24b46]/20">
                    Request a Pop-up
                  </button>
                </div>
              </div>

              {/* ── Map (relative so modal can float over it) ── */}
              <div className="flex-1 min-h-[400px] md:min-h-0 relative">
                <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

                {/* ── Vendor detail modal — top right of map ── */}
                  {activeVendor && (
                    <div className="absolute top-3 right-3 z-[1000] w-[280px] bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.16)] border border-[#e8e2da] overflow-hidden">

                      <div className="relative px-4 pt-4 pb-2 flex items-center justify-center">
                        <p className="font-bold text-[#1f1f1f] text-[16px] leading-snug text-center">
                          {activeVendor.name}
                        </p>
                        <button
                          onClick={() => setActiveVendor(null)}
                          className="absolute right-4 top-4 w-6 h-6 rounded-full bg-[#f0ece6] hover:bg-[#e0dbd3] flex items-center justify-center transition-colors"
                        >
                          <X size={11} className="text-[#7a7a7a]" />
                        </button>
                      </div>
                      {/* Details */}
                      <div className="px-4 py-3 flex flex-col gap-2.5">
                        <div className="flex items-start gap-2.5">
                          <div className="w-6 h-6 rounded-lg bg-[#eef4f0] flex items-center justify-center flex-shrink-0 mt-0.5">
                            <MapPin size={12} className="text-[#2f5d3a]" />
                          </div>
                          <p className="text-[#4a4a4a] text-[12px] leading-snug pt-1">
                            {activeVendor.address}
                          </p>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-lg bg-[#eef4f0] flex items-center justify-center flex-shrink-0">
                            <Calendar size={12} className="text-[#2f5d3a]" />
                          </div>
                          <p className="text-[#4a4a4a] text-[12px]">
                            {activeVendor.startDate} – {activeVendor.endDate}
                          </p>
                        </div>
                      </div>

                      {/* Divider + CTA */}
                      <div className="px-4 pb-4">
                        <button className="w-full h-9 rounded-xl bg-[#2f5d3a] text-white font-semibold text-[12px] tracking-[0.4px] hover:bg-[#254d30] active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-1.5 shadow-sm shadow-[#2f5d3a]/20">
                          <User size={12} />
                          View Profile
                        </button>
                      </div>

                    </div>
                  )}
              </div>

            </div>
          </div>
        </div>

      </div>
    </>
  );
}