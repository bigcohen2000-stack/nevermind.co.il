import {
  CORE_MECHANISM_COUNT,
  type CoreMechanism,
} from "@/lib/profile/core-mechanisms";

export type ProfileProgressStats = {
  mechanismsExplored: number;
  mechanismsTotal: number;
  exploredLabels: CoreMechanism[];
  watchTimeSeconds: number;
  lastMeetingAt: string | null;
};

export function emptyProfileProgressStats(): ProfileProgressStats {
  return {
    mechanismsExplored: 0,
    mechanismsTotal: CORE_MECHANISM_COUNT,
    exploredLabels: [],
    watchTimeSeconds: 0,
    lastMeetingAt: null,
  };
}

/** Dry Hebrew label for cumulative dive depth. */
export function formatDiveDepthHours(totalSeconds: number): string {
  const sec = Math.max(0, Math.floor(totalSeconds));
  if (sec < 60) return "0 שעות";
  const hours = sec / 3600;
  if (hours < 1) {
    const minutes = Math.floor(sec / 60);
    return `${minutes} דקות`;
  }
  const rounded =
    hours < 10 ? Math.round(hours * 10) / 10 : Math.round(hours);
  return `${rounded.toLocaleString("he-IL")} שעות`;
}

export function formatMeetingDate(iso: string | null): string {
  if (!iso) return "אין עדיין";
  return new Date(iso).toLocaleDateString("he-IL", { dateStyle: "medium" });
}
