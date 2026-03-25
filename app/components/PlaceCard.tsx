import Link from "next/link";
import Image from "next/image";
import { EnrichedPlace } from "../lib/types";
import { CATEGORIES } from "../lib/constants";
import { getPlacePrimaryPhoto } from "../lib/places";
import FriendRecBadge from "./FriendRecBadge";

interface Props {
  place: EnrichedPlace;
}

export default function PlaceCard({ place }: Props) {
  const photo = getPlacePrimaryPhoto(place);
  const catInfo = CATEGORIES.find((c) => c.value === place.category);
  const priceStr = place.enriched?.priceLevel
    ? "$".repeat(place.enriched.priceLevel)
    : null;

  return (
    <Link
      href={`/place/${place.id}`}
      className={`group flex flex-col rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow border ${
        place.isFriendRec
          ? "border-dashed border-amber-300"
          : "border-stone-200"
      }`}
    >
      {/* Photo */}
      <div className="relative h-44 bg-stone-100 overflow-hidden">
        {photo ? (
          <Image
            src={photo}
            alt={`${place.name} — ${place.category}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-stone-300">
            {catInfo?.icon}
          </div>
        )}
        {place.isFriendRec && (
          <div className="absolute top-2 left-2">
            <FriendRecBadge />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1.5 p-4">
        <h3 className="font-semibold text-stone-900 leading-snug group-hover:text-sky-700 transition-colors">
          {place.name}
        </h3>
        <div className="flex items-center gap-1.5 text-sm text-stone-500">
          <span>{catInfo?.icon}</span>
          <span>{catInfo?.label}</span>
          <span className="text-stone-300">·</span>
          <span>{place.neighborhood}</span>
          {priceStr && (
            <>
              <span className="text-stone-300">·</span>
              <span>{priceStr}</span>
            </>
          )}
          {place.enriched?.rating && (
            <>
              <span className="text-stone-300">·</span>
              <span>⭐ {place.enriched.rating.toFixed(1)}</span>
            </>
          )}
        </div>
        {place.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {place.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {place.myNotes && (
          <p className="mt-1 text-sm text-stone-500 line-clamp-2">
            {place.myNotes}
          </p>
        )}
      </div>
    </Link>
  );
}
