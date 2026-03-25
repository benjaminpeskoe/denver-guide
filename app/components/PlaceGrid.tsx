"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { EnrichedPlace, Category, Tag } from "../lib/types";
import { filterPlaces } from "../lib/places";
import PlaceCard from "./PlaceCard";

interface Props {
  places: EnrichedPlace[];
}

export default function PlaceGrid({ places }: Props) {
  const searchParams = useSearchParams();

  const filtered = useMemo(() => {
    const category = searchParams.get("category") as Category | null;
    const neighborhood = searchParams.get("neighborhood");
    const tagsParam = searchParams.get("tags");
    const tags = tagsParam ? (tagsParam.split(",") as Tag[]) : [];
    const search = searchParams.get("search") ?? "";

    return filterPlaces(places, { category, neighborhood, tags, search });
  }, [places, searchParams]);

  if (filtered.length === 0) {
    return (
      <div className="py-16 text-center text-stone-400">
        <p className="text-lg">No places match your filters.</p>
        <p className="text-sm mt-1">Try clearing some filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filtered.map((place) => (
        <PlaceCard key={place.id} place={place} />
      ))}
    </div>
  );
}
