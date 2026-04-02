import { getAllPlaces } from "@/app/lib/data";
import { Category, EnrichedPlace } from "@/app/lib/types";

const CATEGORY_LABELS: Record<Category, string> = {
  restaurant: "Restaurants",
  coffeeshop: "Coffee Shops",
  bar: "Bars",
  park: "Parks",
  attraction: "Attractions",
  hike: "Hikes",
  skiing: "Skiing",
  shopping: "Shopping",
};

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildDescription(place: EnrichedPlace): string {
  const lines: string[] = [];

  lines.push(`<b>${escapeXml(place.neighborhood)}</b>`);

  if (place.enriched?.formattedAddress) {
    lines.push(escapeXml(place.enriched.formattedAddress));
  }

  if (place.myNotes) {
    lines.push("", escapeXml(place.myNotes));
  }

  if (place.tags.length > 0) {
    lines.push("", escapeXml(place.tags.join(", ")));
  }

  if (place.enriched?.googleMapsUrl) {
    lines.push("", `<a href="${escapeXml(place.enriched.googleMapsUrl)}">Open in Google Maps</a>`);
  }

  return lines.join("<br/>");
}

function generateKml(places: EnrichedPlace[]): string {
  // Group by first category, only include places with coordinates
  const byCategory = new Map<Category, EnrichedPlace[]>();

  for (const place of places) {
    if (!place.enriched?.lat || !place.enriched?.lng) continue;
    const cat = place.categories[0];
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(place);
  }

  const folders = Array.from(byCategory.entries())
    .map(([cat, catPlaces]) => {
      const placemarks = catPlaces
        .map(
          (p) => `    <Placemark>
      <name>${escapeXml(p.name)}</name>
      <description><![CDATA[${buildDescription(p)}]]></description>
      <Point>
        <coordinates>${p.enriched!.lng},${p.enriched!.lat},0</coordinates>
      </Point>
    </Placemark>`
        )
        .join("\n");

      return `  <Folder>
    <name>${CATEGORY_LABELS[cat]}</name>
${placemarks}
  </Folder>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>My Denver Guide</name>
    <description>Personal recommendations for Denver — denver-guide.vercel.app</description>
${folders}
  </Document>
</kml>`;
}

export async function GET() {
  const places = getAllPlaces();
  const kml = generateKml(places);

  return new Response(kml, {
    headers: {
      "Content-Type": "application/vnd.google-earth.kml+xml",
      "Content-Disposition": 'attachment; filename="denver-guide.kml"',
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
