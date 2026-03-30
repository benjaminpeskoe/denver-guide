import Link from "next/link";
import SubmitForm from "./SubmitForm";

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-sky-700 transition-colors mb-8"
      >
        ← Back to the guide
      </Link>

      <h1 className="text-2xl font-bold text-stone-900 mb-2">
        Recommend a place
      </h1>
      <p className="text-stone-500 text-sm mb-8">
        Know a spot Ben should try? Submit it here. He&apos;ll review it and add it to the guide if it fits.
      </p>

      <SubmitForm />
    </div>
  );
}
