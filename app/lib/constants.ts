import { Category, Tag } from "./types";

export const CATEGORIES: { value: Category; label: string; icon: string }[] = [
  { value: "restaurant", label: "Restaurants", icon: "🍽️" },
  { value: "coffeeshop", label: "Coffee", icon: "☕" },
  { value: "park", label: "Parks", icon: "🌲" },
  { value: "attraction", label: "Attractions", icon: "🎭" },
  { value: "hike", label: "Hikes", icon: "🥾" },
  { value: "skiing", label: "Skiing", icon: "⛷️" },
];

export const TAGS: { value: Tag; label: string }[] = [
  { value: "kid-friendly", label: "Kid-Friendly" },
  { value: "pet-friendly", label: "Pet-Friendly" },
  { value: "open-early", label: "Open Early" },
  { value: "open-late", label: "Open Late" },
  { value: "free", label: "Free" },
  { value: "date-night", label: "Date Night" },
  { value: "outdoor-seating", label: "Outdoor Seating" },
];

export const CATEGORY_COLORS: Record<Category, string> = {
  restaurant: "#e07b54",
  coffeeshop: "#8b6f47",
  park: "#4a7c59",
  attraction: "#7b68ee",
  hike: "#d4a853",
  skiing: "#4a9ece",
};
