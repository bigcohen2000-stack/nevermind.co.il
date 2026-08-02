import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "ניהול",
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

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dark min-h-full bg-zinc-950 text-zinc-100">{children}</div>
  );
}
