import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getAllPlaces, getPlaceById } from "../../lib/data";
import { getNearbyPlaces } from "../../lib/places";
import { CATEGORIES } from "../../lib/constants";
import FriendRecBadge from "../../components/FriendRecBadge";
import NearbyPlaces from "../../components/NearbyPlaces";

export async function generateStaticParams() {
  const places = getAllPlaces();
  return places.map((p) => ({ id: p.id }));
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PlacePage({ params }: Props) {
  const { id } = await params;
  const place = getPlaceById(id);
  if (!place) notFound();

  const allPlaces = getAllPlaces();
  const nearby = getNearbyPlaces(place, allPlaces);
  const catInfos = CATEGORIES.filter((c) => place.categories.includes(c.value));

  const photos = [
    ...place.myPhotos,
    ...(place.enriched?.photos?.map((p) => p.url) ?? []),
  ].slice(0, 3);

  const heroPhoto = photos[0] ?? null;

  const hoursEntries = place.enriched?.hours
    ? Object.entries(place.enriched.hours)
    : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-sky-700 transition-colors mb-6"
      >
        ← Back to all places
      </Link>

      {/* Hero photo */}
      {heroPhoto && (
        <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden bg-stone-100 mb-6">
          <Image
            src={heroPhoto}
            alt={`${place.name} — ${place.categories[0]}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
        </div>
      )}

      {/* Title + meta */}
      <div className="mb-4">
        <div className="flex flex-wrap items-start gap-3 mb-2">
          <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl flex-1">
            {place.name}
          </h1>
          {place.isFriendRec && <FriendRecBadge />}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-stone-500 text-sm">
          <span>
            {catInfos.map((c) => c.icon).join(" ")} {catInfos.map((c) => c.label).join(" · ")}
          </span>
          <span className="text-stone-300">·</span>
          <span>{place.neighborhood}</span>
        </div>

        {/* Tags */}
        {place.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {place.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Ben's Take / Why it's on my list */}
      {place.myNotes && (
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-2">
            {place.isFriendRec ? "Why it's on my list" : "Ben's Take"}
          </p>
          <p className="text-stone-700 leading-relaxed">&ldquo;{place.myNotes}&rdquo;</p>
        </div>
      )}

      {/* Details */}
      {place.enriched && (
        <div className="flex flex-col gap-3 mb-6 text-sm text-stone-700">
          {place.enriched.formattedAddress && (
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0">📍</span>
              <span>{place.enriched.formattedAddress}</span>
            </div>
          )}
          {place.enriched.phone && (
            <div className="flex items-center gap-2">
              <span>📞</span>
              <a href={`tel:${place.enriched.phone}`} className="hover:text-sky-700">
                {place.enriched.phone}
              </a>
            </div>
          )}
          {place.enriched.website && (
            <div className="flex items-center gap-2">
              <span>🌐</span>
              <a
                href={place.enriched.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-sky-700 truncate"
              >
                {place.enriched.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
              </a>
            </div>
          )}
          {hoursEntries.length > 0 && (
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0">🕐</span>
              <div className="flex flex-col gap-0.5">
                {hoursEntries.map(([day, hours]) => (
                  <span key={day}>
                    <span className="capitalize font-medium">{day}</span>: {hours}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CTA buttons */}
      {place.enriched && (
        <div className="flex flex-wrap gap-3 mb-8">
          {place.enriched.googleMapsUrl && (
            <a
              href={place.enriched.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-sky-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-800 transition-colors"
            >
              Open in Google Maps
            </a>
          )}
          {place.enriched.website && (
            <a
              href={place.enriched.website}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-100 transition-colors"
            >
              Visit Website
            </a>
          )}
        </div>
      )}

      {/* Photo gallery */}
      {photos.length > 1 && (
        <div className="grid grid-cols-2 gap-2 mb-8">
          {photos.slice(1).map((photo, i) => (
            <div key={i} className="relative h-40 rounded-xl overflow-hidden bg-stone-100">
              <Image
                src={photo}
                alt={`${place.name} photo ${i + 2}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 384px"
              />
            </div>
          ))}
        </div>
      )}

      {/* Nearby */}
      <NearbyPlaces places={nearby} />
    </div>
  );
}
