import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";

const VALID_CATEGORIES = new Set([
  "restaurant",
  "coffeeshop",
  "park",
  "attraction",
  "hike",
  "skiing",
]);

const VALID_TAGS = new Set([
  "kid-friendly",
  "pet-friendly",
  "open-early",
  "open-late",
  "free",
  "date-night",
  "outdoor-seating",
  "friend-rec",
]);

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function parseBlock(block: string): Record<string, unknown> | null {
  const lines = block
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));

  if (lines.length < 2) return null;

  const name = lines[0];
  const line2Parts = lines[1].split(",").map((s) => s.trim());
  const category = line2Parts[0]?.toLowerCase();
  const neighborhood = line2Parts[1] ?? "";

  if (!VALID_CATEGORIES.has(category)) {
    console.warn(`  Warning: unknown category "${category}" for "${name}"`);
  }

  let tags: string[] = [];
  let myNotes = "";

  if (lines.length >= 3) {
    const potentialTags = lines[2]
      .split(",")
      .map((s) => s.trim().toLowerCase());
    const allAreTags = potentialTags.every((t) => VALID_TAGS.has(t));

    if (allAreTags) {
      tags = potentialTags;
      myNotes = lines.slice(3).join(" ");
    } else {
      myNotes = lines.slice(2).join(" ");
    }
  }

  const isFriendRec = tags.includes("friend-rec");
  const filteredTags = tags.filter((t) => t !== "friend-rec");

  // scan for my photos
  const photosDir = join(process.cwd(), "public", "photos");
  const id = slugify(name);
  let myPhotos: string[] = [];
  if (existsSync(photosDir)) {
    const files = readdirSync(photosDir);
    myPhotos = files
      .filter((f) => f.startsWith(id))
      .map((f) => `/photos/${f}`);
  }

  return {
    id,
    name,
    category,
    neighborhood,
    tags: filteredTags,
    myNotes,
    myPhotos,
    googlePlaceId: null,
    isFriendRec,
    status: isFriendRec ? "want-to-try" : "verified",
  };
}

async function lookupPlaceId(
  name: string,
  neighborhood: string,
  apiKey: string
): Promise<string | null> {
  const query = encodeURIComponent(`${name} Denver CO ${neighborhood}`);
  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${query}&inputtype=textquery&fields=place_id&key=${apiKey}`;
  try {
    const res = await fetch(url);
    const data = (await res.json()) as {
      candidates?: { place_id: string }[];
      status: string;
    };
    if (data.candidates && data.candidates.length > 0) {
      return data.candidates[0].place_id;
    }
  } catch (e) {
    console.warn(`  Failed to look up place ID for "${name}":`, e);
  }
  return null;
}

async function main() {
  const txtPath = join(process.cwd(), "data", "places.txt");
  const outPath = join(process.cwd(), "data", "places.json");
  const cachePath = join(process.cwd(), "data", ".placeid-cache.json");

  const raw = readFileSync(txtPath, "utf-8");
  const blocks = raw.split(/\n\n+/);

  const places: Record<string, unknown>[] = [];
  for (const block of blocks) {
    const place = parseBlock(block);
    if (place) places.push(place);
  }

  console.log(`Parsed ${places.length} places from places.txt`);

  // Load place ID cache
  let cache: Record<string, string> = {};
  if (existsSync(cachePath)) {
    cache = JSON.parse(readFileSync(cachePath, "utf-8"));
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.warn("  GOOGLE_PLACES_API_KEY not set — skipping PlaceId lookup");
  } else {
    for (const place of places) {
      const name = place.name as string;
      const neighborhood = place.neighborhood as string;
      if (cache[name]) {
        place.googlePlaceId = cache[name];
        console.log(`  [cache] ${name}`);
      } else {
        console.log(`  [lookup] ${name}...`);
        const id = await lookupPlaceId(name, neighborhood, apiKey);
        if (id) {
          place.googlePlaceId = id;
          cache[name] = id;
          console.log(`    → ${id}`);
        } else {
          console.warn(`    → not found`);
        }
      }
    }

    writeFileSync(cachePath, JSON.stringify(cache, null, 2));
    console.log("Updated .placeid-cache.json");
  }

  writeFileSync(outPath, JSON.stringify(places, null, 2));
  console.log(`Wrote ${places.length} places to data/places.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
