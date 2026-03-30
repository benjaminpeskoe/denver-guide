import { Suspense } from "react";
import { getAllPlaces } from "./lib/data";
import PlacesExplorer from "./components/PlacesExplorer";

export default function HomePage() {
  const places = getAllPlaces();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Hero */}
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-bold text-stone-900 sm:text-4xl">
          My Denver Guide
        </h1>
        <p className="mt-2 text-stone-500 text-lg">
          My favorite spots around Denver
        </p>
      </div>

      <Suspense>
        <PlacesExplorer places={places} />
      </Suspense>
    </div>
  );
}
