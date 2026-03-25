"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { CATEGORIES, TAGS } from "../lib/constants";
import { Category, Tag } from "../lib/types";

interface Props {
  neighborhoods: string[];
  totalCount: number;
}

export default function FilterBar({ neighborhoods, totalCount }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("category") as Category | null;
  const activeNeighborhood = searchParams.get("neighborhood");
  const activeTags = (searchParams.get("tags") ?? "")
    .split(",")
    .filter(Boolean) as Tag[];
  const activeSearch = searchParams.get("search") ?? "";

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const toggleTag = useCallback(
    (tag: Tag) => {
      const params = new URLSearchParams(searchParams.toString());
      const current = (params.get("tags") ?? "").split(",").filter(Boolean);
      const next = current.includes(tag)
        ? current.filter((t) => t !== tag)
        : [...current, tag];
      if (next.length > 0) {
        params.set("tags", next.join(","));
      } else {
        params.delete("tags");
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const clearAll = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  const hasFilters =
    activeCategory || activeNeighborhood || activeTags.length > 0 || activeSearch;

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-white border border-stone-200 p-4 shadow-sm">
      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => updateParam("category", null)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            !activeCategory
              ? "bg-sky-700 text-white"
              : "bg-stone-100 text-stone-600 hover:bg-stone-200"
          }`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() =>
              updateParam(
                "category",
                activeCategory === cat.value ? null : cat.value
              )
            }
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeCategory === cat.value
                ? "bg-sky-700 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Neighborhood + search row */}
      <div className="flex flex-wrap gap-3">
        <select
          value={activeNeighborhood ?? ""}
          onChange={(e) => updateParam("neighborhood", e.target.value || null)}
          className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
        >
          <option value="">All Neighborhoods</option>
          {neighborhoods.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search..."
          value={activeSearch}
          onChange={(e) => updateParam("search", e.target.value || null)}
          className="flex-1 min-w-[160px] rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
        />
      </div>

      {/* Tag toggles */}
      <div className="flex flex-wrap gap-2">
        {TAGS.map((tag) => {
          const active = activeTags.includes(tag.value);
          return (
            <button
              key={tag.value}
              onClick={() => toggleTag(tag.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                active
                  ? "bg-sky-100 text-sky-800 ring-1 ring-sky-300"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {tag.label}
            </button>
          );
        })}
      </div>

      {/* Result count */}
      <div className="flex items-center justify-between text-sm text-stone-500">
        <span>
          Showing <strong className="text-stone-700">{totalCount}</strong> places
        </span>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-sky-600 hover:text-sky-800 font-medium"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
