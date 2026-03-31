import { EnrichedPlace, Category, Tag } from "./types";

export function filterPlaces(
  places: EnrichedPlace[],
  {
    category,
    neighborhood,
    tags,
    search,
  }: {
    category?: Category | null;
    neighborhood?: string | null;
    tags?: Tag[];
    search?: string;
  }
): EnrichedPlace[] {
  return places.filter((place) => {
    if (category && !place.categories.includes(category)) return false;
    if (neighborhood && place.neighborhood !== neighborhood) return false;
    if (tags && tags.length > 0) {
      if (!tags.every((t) => place.tags.includes(t))) return false;
    }
    if (search && search.trim()) {
      const q = search.toLowerCase();
      if (
        !place.name.toLowerCase().includes(q) &&
        !place.myNotes.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });
}

// Haversine distance in miles
export function distanceMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getNearbyPlaces(
  place: EnrichedPlace,
  allPlaces: EnrichedPlace[],
  count = 3
): (EnrichedPlace & { distanceMi: number })[] {
  const lat = place.enriched?.lat;
  const lng = place.enriched?.lng;
  if (!lat || !lng) return [];

  return allPlaces
    .filter((p) => p.id !== place.id && p.enriched?.lat && p.enriched?.lng)
    .map((p) => ({
      ...p,
      distanceMi: distanceMiles(lat, lng, p.enriched!.lat!, p.enriched!.lng!),
    }))
    .filter((p) => p.distanceMi < 0.5)
    .sort((a, b) => a.distanceMi - b.distanceMi)
    .slice(0, count);
}

export function getNeighborhoods(places: EnrichedPlace[]): string[] {
  return [...new Set(places.map((p) => p.neighborhood))].sort();
}

export function getPlacePrimaryPhoto(place: EnrichedPlace): string | null {
  if (place.myPhotos.length > 0) return place.myPhotos[0];
  if (place.enriched?.photos && place.enriched.photos.length > 0)
    return place.enriched.photos[0].url;
  return null;
}
