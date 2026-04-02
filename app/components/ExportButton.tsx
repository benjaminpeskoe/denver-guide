"use client";

import { useState } from "react";

export default function ExportButton() {
  const [copied, setCopied] = useState(false);

  const kmlUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/export`
      : "/api/export";

  async function handleCopy() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/api/export`
        : "/api/export";
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — fallback: open the URL directly
      window.open(url, "_blank");
    }
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="size-4 shrink-0"
        >
          <path
            fillRule="evenodd"
            d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 15.327 17 12.446 17 8A7 7 0 1 0 3 8c0 4.446 1.698 7.327 3.354 8.585.83.799 1.654 1.38 2.274 1.765.311.193.571.337.757.433a5.741 5.741 0 0 0 .299.148l.006.003ZM10 11.25a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5Z"
            clipRule="evenodd"
          />
        </svg>
        {copied ? "Link copied!" : "Add to Google Maps"}
      </button>
      <span className="hidden sm:inline text-stone-300">·</span>
      <a
        href="/api/export"
        download="denver-guide.kml"
        className="hidden sm:inline text-xs text-stone-400 hover:text-stone-600 transition-colors"
      >
        Download .kml
      </a>
    </div>
  );
}
