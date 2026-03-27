import Link from "next/link";
import Image from "next/image";
import { EnrichedPlace } from "../lib/types";
import { CATEGORIES } from "../lib/constants";
import { getPlacePrimaryPhoto } from "../lib/places";

interface NearbyPlace extends EnrichedPlace {
  distanceMi: number;
}

interface Props {
  places: NearbyPlace[];
}

export default function NearbyPlaces({ places }: Props) {
  if (places.length === 0) return null;

  return (
    <section>
      <h2 className="text-lg font-semibold text-stone-800 mb-4">
        Nearby Recommendations
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {places.map((place) => {
          const photo = getPlacePrimaryPhoto(place);
          const catInfo = CATEGORIES.find((c) => c.value === place.categories[0]);
          return (
            <Link
              key={place.id}
              href={`/place/${place.id}`}
              className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-3 hover:shadow-md transition-shadow"
            >
              <div className="relative h-14 w-14 rounded-lg bg-stone-100 overflow-hidden flex-shrink-0 flex items-center justify-center text-2xl">
                {photo ? (
                  <Image
                    src={photo}
                    alt={place.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                ) : (
                  catInfo?.icon
                )}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-stone-900 text-sm truncate">
                  {place.name}
                </p>
                <p className="text-xs text-stone-500">{place.neighborhood}</p>
                <p className="text-xs text-stone-400 mt-0.5">
                  {place.distanceMi < 0.1
                    ? "< 0.1 mi away"
                    : `${place.distanceMi.toFixed(1)} mi away`}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
