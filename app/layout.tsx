import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ben's Denver Guide",
  description:
    "My favorite spots around the Mile High City — restaurants, coffee, hikes, parks, and more.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen flex flex-col bg-stone-50 text-stone-900 antialiased">
        <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/90 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold text-stone-900 hover:text-sky-700 transition-colors"
            >
              <span className="text-xl">🏔️</span>
              <span>Ben&apos;s Denver Guide</span>
            </Link>
            <nav className="flex items-center gap-6 text-sm font-medium text-stone-600">
              <Link href="/" className="hover:text-sky-700 transition-colors">
                Guide
              </Link>
              <Link
                href="/about"
                className="hover:text-sky-700 transition-colors"
              >
                About
              </Link>
              <Link
                href="/submit"
                className="rounded-full bg-sky-700 px-4 py-1.5 text-white hover:bg-sky-800 transition-colors"
              >
                Suggest a place
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

      </body>
    </html>
  );
}
