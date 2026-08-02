export type BannerSlot =
  | "home_join"
  | "members_hero"
  | "watch_gate"
  | "live"
  | "custom";

export const BANNER_SLOTS: BannerSlot[] = [
  "home_join",
  "members_hero",
  "watch_gate",
  "live",
  "custom",
];

export const SLOT_LABELS: Record<BannerSlot, string> = {
  home_join: "דף הבית: הצטרפות",
  members_hero: "מועדון: כותרת",
  watch_gate: "נעילת צפייה",
  live: "שידור חי",
  custom: "מותאם",
};
