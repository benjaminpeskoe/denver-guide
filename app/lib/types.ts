export type Category =
  | "restaurant"
  | "coffeeshop"
  | "park"
  | "attraction"
  | "hike"
  | "skiing";

export type Tag =
  | "kid-friendly"
  | "pet-friendly"
  | "open-early"
  | "open-late"
  | "free"
  | "date-night"
  | "outdoor-seating"
  | "friend-rec";

export interface Place {
  id: string;
  name: string;
  category: Category;
  neighborhood: string;
  tags: Tag[];
  myNotes: string;
  myPhotos: string[];
  googlePlaceId: string | null;
  isFriendRec: boolean;
  status: "verified" | "want-to-try";
}

export interface EnrichedHours {
  [day: string]: string;
}

export interface EnrichedPhoto {
  url: string;
  attribution: string;
}

export interface EnrichedData {
  formattedAddress: string | null;
  phone: string | null;
  website: string | null;
  googleMapsUrl: string | null;
  hours: EnrichedHours | null;
  rating: number | null;
  totalRatings: number | null;
  priceLevel: number | null;
  photos: EnrichedPhoto[];
  lat: number | null;
  lng: number | null;
  fetchedAt: string;
}

export interface EnrichedPlace extends Place {
  enriched: EnrichedData | null;
}
