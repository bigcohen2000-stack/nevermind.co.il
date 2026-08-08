import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { A11Y_BOOTSTRAP_SCRIPT } from "@/lib/a11y/toolbar-prefs";
import { colors } from "@/lib/design-tokens";
import { shareOgImage, shareOgImageUrl } from "@/lib/og/share-image";
import { THEME_BOOTSTRAP_SCRIPT } from "@/lib/theme/theme";

const SITE_URL = "https://nevermind.co.il";
const DEFAULT_OG_TITLE = "השם לא משנה";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "NeverMind | השם לא משנה",
    template: "%s | NeverMind",
  },
  description:
    "ניתוח לוגי של המציאות: הפרדה בין עובדה לבין סיפור. חקירה לפי נושא, סרטונים ומושגים בעברית.",
  applicationName: "השם לא משנה",
  authors: [{ name: "יקיר כהן", url: SITE_URL }],
  appleWebApp: {
    capable: true,
    title: "השם לא משנה",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    locale: "he_IL",
    url: SITE_URL,
    siteName: "NeverMind | השם לא משנה",
    title: "NeverMind | השם לא משנה",
    description:
      "ניתוח לוגי של המציאות: הפרדה בין עובדה לבין סיפור. חקירה לפי נושא בעברית.",
    images: shareOgImage(DEFAULT_OG_TITLE),
  },
  twitter: {
    card: "summary_large_image",
    title: "NeverMind | השם לא משנה",
    description:
      "ניתוח לוגי של המציאות: הפרדה בין עובדה לבין סיפור. חקירה לפי נושא בעברית.",
    images: [shareOgImageUrl(DEFAULT_OG_TITLE)],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: colors.background,
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");

  return (
    <html
      lang="he"
      dir="rtl"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        {supabaseUrl ? (
          <link rel="preconnect" href={supabaseUrl} crossOrigin="anonymous" />
        ) : null}
        <link rel="preconnect" href="https://i.ytimg.com" />
        <link rel="preconnect" href="https://www.youtube.com" />
        <link rel="dns-prefetch" href="https://i.ytimg.com" />
        <link rel="dns-prefetch" href="https://www.youtube.com" />
      </head>
      <body className="flex min-h-full flex-col overflow-x-clip">
        <Script
          id="nm-theme-bootstrap"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }}
        />
        <Script
          id="nm-a11y-bootstrap"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: A11Y_BOOTSTRAP_SCRIPT }}
        />
        {children}
      </body>
    </html>
  );
}
