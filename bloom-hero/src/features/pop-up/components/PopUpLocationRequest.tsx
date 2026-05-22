"use client";

import { useEffect, useRef, useState } from "react";
import { X, MapPin } from "lucide-react";

interface PopUpLocationRequestProps {
  vendorName: string;
  onSubmit: (payload: {
    location: string;
    latitude: number;
    longitude: number;
    requestedDate: string;
    startTime: string;
    endTime: string;
  }) => void | Promise<void>;
  onClose: () => void;
}

export default function PopUpLocationRequest({
  vendorName,
  onSubmit,
  onClose,
}: PopUpLocationRequestProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    name: string;
  } | null>(null);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<
    { lat: number; lng: number; name: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [requestedDate, setRequestedDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const setMapPin = (lat: number, lng: number, name: string, map?: any) => {
    const activeMap = map ?? mapInstanceRef.current;
    const L = leafletRef.current;
    if (!L) return;
    if (!activeMap) return;

    if (markerRef.current) {
      activeMap.removeLayer(markerRef.current);
    }

    const marker = L.marker([lat, lng]).addTo(activeMap);
    markerRef.current = marker;
    activeMap.setView([lat, lng], 16, { animate: true });
    marker.bindPopup(name).openPopup();
    setSelectedLocation({ lat, lng, name });
  };

  useEffect(() => {
    if (!mapRef.current) return;
    let mounted = true;
    let map: any = null;
    let handleMapClick: ((e: any) => Promise<void>) | null = null;
    let resizeTimer: number | null = null;

    void import("leaflet").then((L) => {
      if (!mounted || !mapRef.current) return;
      leafletRef.current = L;
      map = L.map(mapRef.current).setView([10.3157, 123.8854], 13);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      // Ensure correct tile layout after modal animation/layout settles.
      resizeTimer = window.setTimeout(() => {
        map.invalidateSize();
      }, 150);

      handleMapClick = async (e: any) => {
        const { lat, lng } = e.latlng;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await response.json();
          const address = data.address?.road || data.display_name || `${lat}, ${lng}`;
          setMapPin(lat, lng, address, map);
        } catch {
          setMapPin(lat, lng, `${lat.toFixed(4)}, ${lng.toFixed(4)}`, map);
        }
      };

      map.on("click", handleMapClick);
    });

    return () => {
      mounted = false;
      if (resizeTimer) window.clearTimeout(resizeTimer);
      if (map && handleMapClick) {
        map.off("click", handleMapClick);
      }
      if (map) {
        map.remove();
      }
      mapInstanceRef.current = null;
      markerRef.current = null;
      leafletRef.current = null;
    };
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    const term = query.trim();
    if (!term) {
      setSearchResults([]);
      setSearchError("Type a place to search.");
      return;
    }

    setSearching(true);
    setSearchError(null);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(term)}&limit=5&addressdetails=1`
      );
      const data = (await response.json()) as {
        lat: string;
        lon: string;
        display_name: string;
      }[];

      const mapped = (data ?? [])
        .map((item) => ({
          lat: Number(item.lat),
          lng: Number(item.lon),
          name: item.display_name,
        }))
        .filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng));

      setSearchResults(mapped);
      if (mapped.length === 0) {
        setSearchError("No places found.");
      } else {
        const bestMatch = mapped[0];
        setMapPin(bestMatch.lat, bestMatch.lng, bestMatch.name);
        setQuery(bestMatch.name);
        setSearchError(null);
      }
    } catch {
      setSearchResults([]);
      setSearchError("Search failed. Try again.");
    } finally {
      setSearching(false);
    }
  };

  const handleSelectSearchResult = (result: {
    lat: number;
    lng: number;
    name: string;
  }) => {
    setMapPin(result.lat, result.lng, result.name);
    setQuery(result.name);
    setSearchResults([]);
    setSearchError(null);
  };

  const handleSubmit = async () => {
    if (!selectedLocation || !requestedDate || !startTime || !endTime) return;

    setIsLoading(true);
    try {
      await onSubmit({
        location: selectedLocation.name,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        requestedDate,
        startTime,
        endTime,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />

      <div
        className="modal-overlay"
        onClick={onClose}
      >
      <div
        className="flex max-h-[80dvh] w-full max-w-md flex-col overflow-hidden rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#ece4dc] px-3 py-2.5 sm:px-4">
          <h2 className="text-sm font-semibold text-[#2c2825]">
            Request pop-up location
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[#8a847d] hover:bg-[#f3eee8] hover:text-[#4a453f]"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="scrollbar-thin-oval min-h-0 flex-1 overflow-y-auto overscroll-contain pr-0.5">
          <div className="flex flex-col gap-3 p-3 sm:p-4">
          <div className="text-xs text-[#8a847d]">
            <p>
              Search a place or click on the map to select a location for {vendorName}'s next pop-up.
            </p>
          </div>

          <form onSubmit={handleSearch} className="space-y-2">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search address or place"
                className="w-full min-w-0 rounded-lg border border-[#e0d8cf] px-2.5 py-1.5 text-sm outline-none focus:border-[#2f5d3a]"
              />
              <button
                type="submit"
                disabled={searching}
                className="shrink-0 rounded-lg bg-[#2f5d3a] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#254a2f] disabled:opacity-50 sm:w-auto"
              >
                {searching ? "Searching..." : "Search"}
              </button>
            </div>

            {searchError && (
              <p className="text-xs text-[#d24b46]">{searchError}</p>
            )}

            {searchResults.length > 0 && (
              <div className="scrollbar-thin-oval max-h-28 overflow-y-auto rounded-lg border border-[#ece5dd] bg-white">
                {searchResults.map((result, index) => (
                  <button
                    key={`${result.name}-${index}`}
                    type="button"
                    onClick={() => handleSelectSearchResult(result)}
                    className="block w-full border-b border-[#f3eee8] px-2.5 py-1.5 text-left text-xs text-[#4a453f] hover:bg-[#fbf9f6] last:border-b-0"
                  >
                    {result.name}
                  </button>
                ))}
              </div>
            )}
          </form>

          <div
            ref={mapRef}
            className="h-36 w-full shrink-0 rounded-lg border border-[#ece5dd] sm:h-40"
          />

          {selectedLocation && (
            <div className="rounded-lg border border-[#ece5dd] bg-[#fbf9f6] p-2.5">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0 text-[#2f5d3a]" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-[#2c2825]">
                    {selectedLocation.name}
                  </p>
                  <p className="mt-1 text-xs text-[#8a847d]">
                    {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <input
              type="date"
              value={requestedDate}
              onChange={(e) => setRequestedDate(e.target.value)}
              className="rounded-lg border border-[#e0d8cf] px-2.5 py-1.5 text-sm"
            />
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="rounded-lg border border-[#e0d8cf] px-2.5 py-1.5 text-sm"
            />
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="rounded-lg border border-[#e0d8cf] px-2.5 py-1.5 text-sm"
            />
          </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-[#ece4dc] px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:flex sm:justify-end sm:gap-2 sm:px-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full border border-[#e0d8cf] px-3 py-2 text-xs font-medium text-[#4a453f] hover:bg-[#f3eee8] sm:w-auto"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedLocation || !requestedDate || !startTime || !endTime || isLoading}
            className="mt-1.5 w-full rounded-full bg-[#2f5d3a] px-3 py-2 text-xs font-semibold text-white shadow-[0_6px_16px_rgba(25,118,72,0.24)] hover:bg-[#254a2f] disabled:opacity-50 sm:mt-0 sm:w-auto"
          >
            {isLoading ? "Submitting..." : "Submit request"}
          </button>
        </div>
      </div>
      </div>
    </>
  );
}