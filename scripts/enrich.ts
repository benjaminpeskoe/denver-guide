import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  createWriteStream,
} from "fs";
import { join } from "path";
import https from "https";

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

async function downloadFile(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(destPath);
    https
      .get(url, (res) => {
        res.pipe(file);
        file.on("finish", () => file.close(() => resolve()));
      })
      .on("error", reject);
  });
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

    return {
      formattedAddress: r.formatted_address ?? null,
      phone: r.formatted_phone_number ?? null,
      website: r.website ?? null,
      googleMapsUrl: r.url ?? null,
      hours,
      rating: r.rating ?? null,
      totalRatings: r.user_ratings_total ?? null,
      priceLevel: r.price_level ?? null,
      photos: [], // filled below
      lat: r.geometry?.location?.lat ?? null,
      lng: r.geometry?.location?.lng ?? null,
      fetchedAt: new Date().toISOString(),
    };
  } catch (e) {
    console.warn(`  Failed to fetch details for ${placeId}:`, e);
    return null;
  }
}

async function fetchAndDownloadPhotos(
  placeId: string,
  placeSlug: string,
  apiKey: string,
  photosData: { photo_reference: string; html_attributions: string[] }[]
): Promise<{ url: string; attribution: string }[]> {
  const photosDir = join(process.cwd(), "public", "enriched-photos");
  if (!existsSync(photosDir)) mkdirSync(photosDir, { recursive: true });

  const results: { url: string; attribution: string }[] = [];
  const toFetch = photosData.slice(0, 3);

  for (let i = 0; i < toFetch.length; i++) {
    const photo = toFetch[i];
    const filename = `${placeSlug}-${i}.jpg`;
    const destPath = join(photosDir, filename);
    const publicUrl = `/enriched-photos/${filename}`;

    if (!existsSync(destPath)) {
      const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photo.photo_reference}&key=${apiKey}`;
      try {
        await downloadFile(photoUrl, destPath);
      } catch (e) {
        console.warn(`  Failed to download photo for ${placeSlug}:`, e);
        continue;
      }
    }

    results.push({
      url: publicUrl,
      attribution: photo.html_attributions[0] ?? "",
    });
  }

  return results;
}

async function main() {
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
    console.warn(
      "GOOGLE_PLACES_API_KEY not set — building without enrichment"
    );
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

    if (!enriched) {
      output.push({ ...place, enriched: null });
      continue;
    }

    // Fetch photos from raw API response (re-fetch for photo_references)
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.googlePlaceId}&fields=photos&key=${apiKey}`;
    try {
      const res = await fetch(detailsUrl);
      const data = (await res.json()) as {
        result?: {
          photos?: { photo_reference: string; html_attributions: string[] }[];
        };
      };
      if (data.result?.photos) {
        enriched.photos = await fetchAndDownloadPhotos(
          place.googlePlaceId,
          place.id,
          apiKey,
          data.result.photos
        );
      }
    } catch (e) {
      console.warn(`  Failed to fetch photos for ${place.name}:`, e);
    }

    output.push({ ...place, enriched });
  }

  writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`Wrote ${output.length} places to data/places-enriched.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
