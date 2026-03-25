"use client";

import { useEffect, useRef } from "react";
import { EnrichedPlace } from "../lib/types";
import { CATEGORIES, CATEGORY_COLORS } from "../lib/constants";
import { getPlacePrimaryPhoto } from "../lib/places";

interface Props {
  places: EnrichedPlace[];
  highlightId?: string;
}

export default function MapView({ places, highlightId }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Dynamically import leaflet (no SSR)
    import("leaflet").then((L) => {
      // Fix default marker icons
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Destroy existing map
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }

      const placesWithCoords = places.filter(
        (p) => p.enriched?.lat && p.enriched?.lng
      );

      const centerLat =
        placesWithCoords.length > 0
          ? placesWithCoords.reduce(
              (sum, p) => sum + (p.enriched?.lat ?? 0),
              0
            ) / placesWithCoords.length
          : 39.7392;

      const centerLng =
        placesWithCoords.length > 0
          ? placesWithCoords.reduce(
              (sum, p) => sum + (p.enriched?.lng ?? 0),
              0
            ) / placesWithCoords.length
          : -104.9903;

      const map = L.map(mapRef.current!).setView(
        [centerLat, centerLng],
        13
      );
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      for (const place of placesWithCoords) {
        const lat = place.enriched!.lat!;
        const lng = place.enriched!.lng!;
        const color = CATEGORY_COLORS[place.category] ?? "#888";
        const catInfo = CATEGORIES.find((c) => c.value === place.category);

        const icon = L.divIcon({
          html: `<div style="background:${color};width:28px;height:28px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:13px;">${catInfo?.icon ?? "📍"}</div>`,
          className: "",
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([lat, lng], { icon }).addTo(map);
        marker.bindPopup(
          `<strong>${place.name}</strong><br/><a href="/place/${place.id}" style="color:#0369a1">View details →</a>`
        );

        if (place.id === highlightId) {
          marker.openPopup();
        }
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
  }, [places, highlightId]);

  useEffect(() => {
    // Load leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
  }, []);

  return (
    <div className="flex gap-4 h-[600px]">
      <div ref={mapRef} className="flex-1 rounded-2xl overflow-hidden border border-stone-200" />
      <div className="w-72 overflow-y-auto flex flex-col gap-2 hidden lg:flex">
        {places.map((place) => {
          const photo = getPlacePrimaryPhoto(place);
          const catInfo = CATEGORIES.find((c) => c.value === place.category);
          return (
            <a
              key={place.id}
              href={`/place/${place.id}`}
              className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-2 hover:bg-stone-50 transition-colors"
            >
              <div className="relative h-12 w-12 rounded-lg bg-stone-100 overflow-hidden flex-shrink-0 flex items-center justify-center text-xl">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo}
                    alt={place.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  catInfo?.icon
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-stone-800 truncate">
                  {place.name}
                </p>
                <p className="text-xs text-stone-500">{place.neighborhood}</p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
