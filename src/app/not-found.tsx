import type { Metadata } from "next";

import { NotFoundView } from "@/components/layout/not-found-view";
import { SiteShell } from "@/components/layout/site-shell";

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
 * Global 404 for unmatched URLs (root layout only).
 * Wraps SiteShell so the page still has site chrome.
 */
export default async function NotFound() {
  return (
    <SiteShell>
      <NotFoundView />
    </SiteShell>
  );
}
