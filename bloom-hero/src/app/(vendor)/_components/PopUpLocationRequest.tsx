"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { X, MapPin } from "lucide-react";

interface PopUpLocationRequestProps {
  vendorName: string;
  onSubmit: (location: string) => void;
  onClose: () => void;
}

export default function PopUpLocationRequest({
  vendorName,
  onSubmit,
  onClose,
}: PopUpLocationRequestProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
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

  const setMapPin = (lat: number, lng: number, name: string, map?: L.Map) => {
    const activeMap = map ?? mapInstanceRef.current;
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

    const map = L.map(mapRef.current).setView([10.3157, 123.8854], 13);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    // Ensure correct tile layout after modal animation/layout settles.
    const resizeTimer = window.setTimeout(() => {
      map.invalidateSize();
    }, 150);

    const handleMapClick = async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const data = await response.json();
        const address = data.address?.road || data.display_name || `${lat}, ${lng}`;
        setMapPin(lat, lng, address, map);
      } catch (error) {
        setMapPin(lat, lng, `${lat.toFixed(4)}, ${lng.toFixed(4)}`, map);
      }
    };

    map.on("click", handleMapClick);

    return () => {
      window.clearTimeout(resizeTimer);
      map.off("click", handleMapClick);
      map.remove();
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
    if (!selectedLocation) return;

    setIsLoading(true);
    try {
      onSubmit(selectedLocation.name);
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

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex h-screen max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white sm:h-auto">
        <div className="flex items-center justify-between border-b border-[#ece4dc] px-6 py-4">
          <h2 className="text-lg font-semibold text-[#2c2825]">
            Request pop-up location
          </h2>
          <button
            onClick={onClose}
            className="text-[#8a847d] hover:text-[#4a453f]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 flex-col gap-4 overflow-hidden p-6 sm:flex">
          <div className="text-sm text-[#8a847d]">
            <p>
              Search a place or click on the map to select a location for {vendorName}'s next pop-up.
            </p>
          </div>

          <form onSubmit={handleSearch} className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search address or place"
                className="w-full rounded-xl border border-[#e0d8cf] px-3 py-2 text-sm outline-none focus:border-[#2f5d3a]"
              />
              <button
                type="submit"
                disabled={searching}
                className="rounded-xl bg-[#2f5d3a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#254a2f] disabled:opacity-50"
              >
                {searching ? "Searching..." : "Search"}
              </button>
            </div>

            {searchError && (
              <p className="text-xs text-[#d24b46]">{searchError}</p>
            )}

            {searchResults.length > 0 && (
              <div className="max-h-36 overflow-y-auto rounded-xl border border-[#ece5dd] bg-white">
                {searchResults.map((result, index) => (
                  <button
                    key={`${result.name}-${index}`}
                    type="button"
                    onClick={() => handleSelectSearchResult(result)}
                    className="block w-full border-b border-[#f3eee8] px-3 py-2 text-left text-sm text-[#4a453f] hover:bg-[#fbf9f6] last:border-b-0"
                  >
                    {result.name}
                  </button>
                ))}
              </div>
            )}
          </form>

          <div
            ref={mapRef}
            className="h-96 w-full rounded-xl border border-[#ece5dd]"
          />

          {selectedLocation && (
            <div className="rounded-xl border border-[#ece5dd] bg-[#fbf9f6] p-4">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 shrink-0 text-[#2f5d3a]" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#2c2825]">
                    {selectedLocation.name}
                  </p>
                  <p className="mt-1 text-xs text-[#8a847d]">
                    {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-[#ece4dc] px-6 py-4 sm:flex sm:justify-end sm:gap-3">
          <button
            onClick={onClose}
            className="w-full rounded-full border border-[#e0d8cf] px-4 py-2.5 text-sm font-medium text-[#4a453f] hover:bg-[#f3eee8] sm:w-auto"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedLocation || isLoading}
            className="mt-2 w-full rounded-full bg-[#2f5d3a] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(25,118,72,0.28)] hover:bg-[#254a2f] disabled:opacity-50 sm:mt-0 sm:w-auto"
          >
            {isLoading ? "Submitting..." : "Submit request"}
          </button>
        </div>
      </div>
      </div>
    </>
  );
}