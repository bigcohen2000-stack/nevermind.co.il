import type { Metadata } from "next";

export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

const DEFAULT_TITLE = "השם לא משנה";

/** Relative OG image URL resolved against metadataBase. */
export function shareOgImageUrl(title: string): string {
  const safe = title.trim() || DEFAULT_TITLE;
  return `/api/og?title=${encodeURIComponent(safe)}`;
}

export function shareOgImage(title: string) {
  const safe = title.trim() || DEFAULT_TITLE;
  return [
    {
      url: shareOgImageUrl(safe),
      width: OG_IMAGE_WIDTH,
      height: OG_IMAGE_HEIGHT,
      alt: safe,
    },
  ];
}

/** openGraph.images + twitter summary_large_image for page metadata. */
export function shareImageMetadata(
  title: string,
): Pick<Metadata, "openGraph" | "twitter"> {
  const images = shareOgImage(title);
  return {
    openGraph: { images },
    twitter: {
      card: "summary_large_image",
      images: images.map((image) => image.url),
    },
  };
}
