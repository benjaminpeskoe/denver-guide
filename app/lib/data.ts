import { readFileSync } from "fs";
import { join } from "path";
import { EnrichedPlace } from "./types";

export function getAllPlaces(): EnrichedPlace[] {
  try {
    const filePath = join(process.cwd(), "data", "places-enriched.json");
    const raw = readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as EnrichedPlace[];
  } catch {
    return [];
  }
}

export function getPlaceById(id: string): EnrichedPlace | null {
  const places = getAllPlaces();
  return places.find((p) => p.id === id) ?? null;
}
