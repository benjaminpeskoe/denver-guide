import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-stone-900 mb-6">
        About This Guide
      </h1>
      <div className="prose prose-stone space-y-4 text-stone-700 leading-relaxed">
        <p>
          Hi, I&apos;m Ben! I live in Denver with my family and love exploring
          the city.
        </p>
        <p>
          This is my personal guide to the best spots in Denver — restaurants,
          coffee shops, hikes, parks, and more. I built it so I&apos;d have a
          single link to share whenever friends and family visit and ask
          &ldquo;what should we do?&rdquo;
        </p>
        <p>
          Every recommendation here is a place I&apos;ve personally been to and
          enjoyed, unless it&apos;s marked as{" "}
          <span className="font-medium text-amber-700">
            &ldquo;on my list&rdquo;
          </span>{" "}
          — those are spots that have been recommended to me but I haven&apos;t
          tried yet.
        </p>
        <p>
          I have two young kids, so while not every recommendation on here is
          kid friendly, the list definitely skews toward places that parents of
          young kids might go (eg there aren&apos;t a lot of late night clubs,
          but there are some good places for a date night).
        </p>
        <p>Have a great time in Denver! 🏔️</p>
        <p>
          Have a place you think I should try?{" "}
          <Link href="/submit" className="text-sky-700 hover:text-sky-800 font-medium">
            Submit it here.
          </Link>
        </p>
      </div>
      <div className="mt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-sky-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-800 transition-colors"
        >
          ← Back to the guide
        </Link>
      </div>
    </div>
  );
}
