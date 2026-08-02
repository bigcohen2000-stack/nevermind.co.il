import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "לא נמצא",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      noarchive: true,
      nosnippet: true,
    },
  },
};

/**
 * Generic 404 used when /studio is probed without a session.
 * Looks like a normal missing page (no studio hints).
 */
export default function NotFoundStudioPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col justify-center px-6 py-16 text-start">
      <h1 className="text-2xl font-semibold tracking-tight">העמוד לא נמצא</h1>
      <p className="mt-4 text-sm leading-relaxed text-foreground/70">
        הכתובת אינה קיימת, או שאין גישה אליה.
      </p>
      <p className="mt-8">
        <Link href="/" className="btn btn-secondary text-sm">
          חזרה לבית
        </Link>
      </p>
    </main>
  );
}
