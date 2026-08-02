"use client";

import { HoverEffect } from "@/components/ui/card-hover-effect";

export type ConceptCardItem = {
  name: string;
  category: string | null;
  videoCount: number;
};

function formatVideoCount(count: number): string {
  if (count === 1) return "סרטון אחד";
  return `${count} סרטונים`;
}

export function ConceptDirectoryGrid({ items }: { items: ConceptCardItem[] }) {
  const hoverItems = items.map((item) => ({
    title: `${item.name} (${formatVideoCount(item.videoCount)})`,
    description: item.category?.trim()
      ? item.category
      : "לחצו לחיפוש סרטונים ומאמרים בנושא",
    link: `/search?q=${encodeURIComponent(item.name)}`,
  }));

  return <HoverEffect items={hoverItems} className="py-2" />;
}
