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
  /** scheduled | confirmed | held | cancelled */
  lastMeetingStatus: string | null;
  /** Absolute path when a V confirmation is pending. */
  pendingConfirmPath: string | null;
  completedCount: number;
  historyCount: number;
  recentSearches: string[];
  /** Distinct calendar days with watch history in the last 7 days. */
  activeDaysLast7: number;
};

export function emptyProfileProgressStats(): ProfileProgressStats {
  return {
    mechanismsExplored: 0,
    mechanismsTotal: CORE_MECHANISM_COUNT,
    exploredLabels: [],
    watchTimeSeconds: 0,
    lastMeetingAt: null,
    lastMeetingStatus: null,
    pendingConfirmPath: null,
    completedCount: 0,
    historyCount: 0,
    recentSearches: [],
    activeDaysLast7: 0,
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

export function formatMeetingStatus(status: string | null): string {
  if (!status) return "";
  if (status === "scheduled") return "מתוכננת";
  if (status === "confirmed") return "אושרה (V)";
  if (status === "held") return "התקיימה";
  if (status === "cancelled") return "בוטלה";
  return status;
}
