"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        // Keep attribution control ON (default) so the © renders on the map
        attributionControl: true,
      });

      // OSM tile layer with required attribution text
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors &nbsp;|&nbsp; Map powered by <a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>',
      }).addTo(map);

      vendors.forEach((vendor) => {
        const icon = L.divIcon({
          className: "",
          html: `<div style="
            width:30px;height:30px;
            background:#2f5d3a;border-radius:50%;
            display:flex;align-items:center;justify-content:center;
            color:white;font-weight:700;font-size:13px;
            font-family:var(--font-quicksand),sans-serif;
            box-shadow:0 2px 8px rgba(0,0,0,0.2);
            border:2px solid white;
          ">${vendor.displayNumber}</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        const marker = L.marker([vendor.lat, vendor.lng], { icon }).addTo(map);
        marker.on("click", () => handleVendorSelect(vendor));
      });

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapInstanceRef.current as any).remove();
        mapInstanceRef.current = null;
      }
    };
  }, [vendors]);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />

      <div className="w-full flex flex-col items-center">

        {/* ── Section header ── */}
        <div className="w-full flex flex-col items-center gap-3 py-16 border-b border-[#edeae6] px-6">
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
        <div className="w-full flex justify-center px-6 py-16 border-b border-[#edeae6]">
          <div
            className="w-full max-w-6xl rounded-[16px] overflow-hidden shadow-[0px_8px_24px_0px_rgba(0,0,0,0.06)]"
            style={{ border: "1px solid #edeae6" }}
          >
            <div className="flex flex-col md:flex-row" style={{ height: "620px" }}>

              {/* ── Sidebar ── */}
              <div
                className="w-full md:w-[320px] flex-shrink-0 flex flex-col p-6 border-b md:border-b-0 md:border-r border-[#edeae6]"
                style={{ background: "#fdfaf7" }}
              >
                <Link
                  href="/"
                  className="flex items-center gap-2 mb-6 text-[#6f6f6f] hover:text-[#1f1f1f] transition-colors w-fit"
                >
                  <ArrowLeft size={15} />
                  <span className="font-medium text-[13px] tracking-[0.65px]">Back</span>
                </Link>

                <p className="font-semibold text-[#2f5d3a] text-[13px] tracking-[0.65px] uppercase leading-[1.6] mb-4">
                  Active Pop-ups
                </p>

                <div className="flex-1 overflow-y-auto space-y-1 -mx-2 pr-1">
                  {vendors.length === 0 && (
                    <p className="px-3 py-2 text-[12px] text-[#7a7a7a]">No pop-up locations available.</p>
                  )}
                  {vendors.map((vendor) => (
                    <button
                      key={vendor.id}
                      onClick={() => handleVendorSelect(vendor)}
                      className={`w-full text-left px-3 py-3 rounded-[10px] transition-all duration-150 ${
                        activeVendor === vendor.id
                          ? "bg-[#f5f1ec]"
                          : "hover:bg-[#f5f1ec]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 mt-0.5 w-[22px] h-[22px] rounded-full bg-[#2f5d3a] text-white text-[11px] font-bold flex items-center justify-center">
                          {vendor.displayNumber}
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#1f1f1f] text-[14px] leading-snug tracking-[0.14px]">
                            {vendor.name}
                          </p>
                          <p className="font-medium text-[#7a7a7a] text-[12px] mt-0.5 leading-snug tracking-[0.6px]">
                            {vendor.address}
                          </p>
                          <p className="font-medium text-[#7a7a7a] text-[12px] mt-1 tracking-[0.6px]">
                            {vendor.startDate} – {vendor.endDate}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-5 pt-4 border-t border-[#edeae6] flex-shrink-0">
                  <button className="w-full h-[44px] rounded-[999px] bg-[#d24b46] text-white font-medium text-[14px] tracking-[0.56px] shadow-[0px_6px_16px_0px_rgba(0,0,0,0.12)] hover:opacity-90 active:scale-95 transition-all duration-150">
                    Request Pop-up
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