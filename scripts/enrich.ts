import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

// Load .env.local for local dev (Vercel injects env vars directly)
function loadLocalEnv() {
  const envPath = join(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const eqIdx = line.indexOf("=");
    if (eqIdx === -1) continue;
    const key = line.slice(0, eqIdx).trim();
    const val = line.slice(eqIdx + 1).trim();
    if (key && !process.env[key]) process.env[key] = val;
  }
}

const CACHE_TTL_DAYS = 7;

interface PlaceRecord {
  id: string;
  name: string;
  googlePlaceId: string | null;
  [key: string]: unknown;
}

interface EnrichedRecord extends PlaceRecord {
  enriched: EnrichedData | null;
}

interface EnrichedData {
  formattedAddress: string | null;
  phone: string | null;
  website: string | null;
  googleMapsUrl: string | null;
  hours: Record<string, string> | null;
  rating: number | null;
  totalRatings: number | null;
  priceLevel: number | null;
  photos: { url: string; attribution: string }[];
  lat: number | null;
  lng: number | null;
  fetchedAt: string;
}

function isFresh(enriched: EnrichedData): boolean {
  if (!enriched.fetchedAt) return false;
  const fetched = new Date(enriched.fetchedAt).getTime();
  const now = Date.now();
  return now - fetched < CACHE_TTL_DAYS * 24 * 60 * 60 * 1000;
}

async function fetchPlaceDetails(
  placeId: string,
  apiKey: string
): Promise<EnrichedData | null> {
  const fields = [
    "formatted_address",
    "formatted_phone_number",
    "website",
    "url",
    "opening_hours",
    "rating",
    "user_ratings_total",
    "price_level",
    "photos",
    "geometry",
  ].join(",");

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = (await res.json()) as {
      result?: {
        formatted_address?: string;
        formatted_phone_number?: string;
        website?: string;
        url?: string;
        opening_hours?: { weekday_text?: string[] };
        rating?: number;
        user_ratings_total?: number;
        price_level?: number;
        photos?: { photo_reference: string; html_attributions: string[] }[];
        geometry?: { location?: { lat: number; lng: number } };
      };
      status: string;
    };

    if (!data.result) return null;
    const r = data.result;

    // Parse hours
    let hours: Record<string, string> | null = null;
    if (r.opening_hours?.weekday_text) {
      hours = {};
      for (const line of r.opening_hours.weekday_text) {
        const [day, ...rest] = line.split(": ");
        hours[day.toLowerCase()] = rest.join(": ");
      }
    }

    // Build photo URLs pointing to our API proxy route
    const photos = (r.photos ?? []).slice(0, 3).map((p) => ({
      url: `/api/photo?ref=${encodeURIComponent(p.photo_reference)}`,
      attribution: p.html_attributions[0] ?? "",
    }));

    return {
      formattedAddress: r.formatted_address ?? null,
      phone: r.formatted_phone_number ?? null,
      website: r.website ?? null,
      googleMapsUrl: r.url ?? null,
      hours,
      rating: r.rating ?? null,
      totalRatings: r.user_ratings_total ?? null,
      priceLevel: r.price_level ?? null,
      photos,
      lat: r.geometry?.location?.lat ?? null,
      lng: r.geometry?.location?.lng ?? null,
      fetchedAt: new Date().toISOString(),
    };
  } catch (e) {
    console.warn(`  Failed to fetch details for ${placeId}:`, e);
    return null;
  }
}

async function main() {
  loadLocalEnv();
  const placesPath = join(process.cwd(), "data", "places.json");
  const outPath = join(process.cwd(), "data", "places-enriched.json");

  if (!existsSync(placesPath)) {
    console.error("data/places.json not found — run parse-places.ts first");
    process.exit(1);
  }

  const places: PlaceRecord[] = JSON.parse(readFileSync(placesPath, "utf-8"));

  // Load existing enriched data for caching
  let existing: Record<string, EnrichedRecord> = {};
  if (existsSync(outPath)) {
    const arr: EnrichedRecord[] = JSON.parse(readFileSync(outPath, "utf-8"));
    for (const p of arr) existing[p.id] = p;
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.warn("GOOGLE_PLACES_API_KEY not set — building without enrichment");
    const output = places.map((p) => ({ ...p, enriched: null }));
    writeFileSync(outPath, JSON.stringify(output, null, 2));
    console.log(`Wrote ${output.length} places to data/places-enriched.json`);
    return;
  }

  const output: EnrichedRecord[] = [];

  for (const place of places) {
    const cached = existing[place.id];

    // Use cached enrichment if fresh and placeId hasn't changed
    if (
      cached?.enriched &&
      isFresh(cached.enriched) &&
      cached.googlePlaceId === place.googlePlaceId
    ) {
      console.log(`  [cache] ${place.name}`);
      output.push({ ...place, enriched: cached.enriched });
      continue;
    }

    if (!place.googlePlaceId) {
      console.log(`  [skip] ${place.name} — no googlePlaceId`);
      output.push({ ...place, enriched: null });
      continue;
    }

    console.log(`  [fetch] ${place.name}...`);
    const enriched = await fetchPlaceDetails(place.googlePlaceId, apiKey);
    output.push({ ...place, enriched: enriched ?? null });
  }

  writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`Wrote ${output.length} places to data/places-enriched.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
