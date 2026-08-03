"use client";

import { useMemo, useState, useTransition } from "react";

import {
  deleteBanner,
  setBannerActive,
  upsertBanner,
} from "@/actions/studio-banners";
import {
  BANNER_DRAFTS,
  BANNER_FIELD_SUGGESTIONS,
  BANNER_WRITING_TIPS,
  draftsForSlot,
  slotHint,
  type BannerDraft,
} from "@/lib/studio/banner-templates";
import {
  BANNER_SLOTS,
  SLOT_LABELS,
  type BannerSlot,
} from "@/lib/studio/banners-shared";
import { GENERIC_ADD_TIPS } from "@/lib/studio/writing-tips";
import type { SiteBanner } from "@/types/supabase";

type StudioBannersPanelProps = {
  initialBanners: SiteBanner[];
};

type BannerFormState = {
  id?: string;
  slot: BannerSlot;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  sortOrder: number;
  isActive: boolean;
};

const EMPTY_FORM: BannerFormState = {
  slot: "members_hero",
  title: "",
  body: "",
  ctaLabel: "",
  ctaHref: "",
  sortOrder: 0,
  isActive: false,
};

function bannerToForm(banner: SiteBanner): BannerFormState {
  return {
    id: banner.id,
    slot: banner.slot as BannerSlot,
    title: banner.title,
    body: banner.body,
    ctaLabel: banner.cta_label ?? "",
    ctaHref: banner.cta_href ?? "",
    sortOrder: banner.sort_order,
    isActive: banner.is_active,
  };
}

function draftToForm(draft: BannerDraft): BannerFormState {
  return {
    slot: draft.slot,
    title: draft.title,
    body: draft.body,
    ctaLabel: draft.ctaLabel,
    ctaHref: draft.ctaHref,
    sortOrder: 0,
    isActive: false,
  };
}

function SuggestionChips({
  label,
  items,
  onPick,
}: {
  label: string;
  items: string[];
  onPick: (value: string) => void;
}) {
  return (
    <div className="mt-2">
      <p className="text-[10px] tracking-wide text-zinc-500">{label}</p>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {items.map((item) => (
          <button
            key={item}
            type="button"
            className="border border-zinc-700 px-2 py-1 text-[11px] text-zinc-300 hover:border-zinc-500 hover:text-zinc-100"
            onClick={() => onPick(item)}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

export function StudioBannersPanel({
  initialBanners,
}: StudioBannersPanelProps) {
  const [banners, setBanners] = useState(initialBanners);
  const [form, setForm] = useState<BannerFormState>(EMPTY_FORM);
  const [hint, setHint] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [draftFilter, setDraftFilter] = useState<BannerSlot | "all">("all");

  const grouped = useMemo(() => {
    const map = new Map<BannerSlot, SiteBanner[]>();
    for (const slot of BANNER_SLOTS) {
      map.set(slot, []);
    }
    for (const banner of banners) {
      const slot = banner.slot as BannerSlot;
      const list = map.get(slot) ?? [];
      list.push(banner);
      map.set(slot, list);
    }
    return map;
  }, [banners]);

  const visibleDrafts = useMemo(
    () =>
      draftFilter === "all"
        ? BANNER_DRAFTS
        : draftsForSlot(draftFilter),
    [draftFilter],
  );

  const fieldSuggestions = BANNER_FIELD_SUGGESTIONS[form.slot];

  function resetForm() {
    setForm(EMPTY_FORM);
  }

  function applyDraft(draft: BannerDraft) {
    setForm(draftToForm(draft));
    setHint(`נטענה תבנית: ${draft.label}. ערוך ושמור. נשמר כבוי עד שתפעיל.`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function saveForm() {
    startTransition(async () => {
      const result = await upsertBanner({
        id: form.id,
        slot: form.slot,
        title: form.title,
        body: form.body,
        ctaLabel: form.ctaLabel || undefined,
        ctaHref: form.ctaHref || undefined,
        sortOrder: form.sortOrder,
        isActive: form.isActive,
      });

      if (!result.ok) {
        setHint(result.error);
        return;
      }

      if (result.banner) {
        setBanners((prev) => {
          const without = prev.filter((b) => b.id !== result.banner!.id);
          const next = [...without, result.banner!];
          if (result.banner!.is_active) {
            return next.map((b) =>
              b.slot === result.banner!.slot && b.id !== result.banner!.id
                ? { ...b, is_active: false }
                : b,
            );
          }
          return next;
        });
      }

      setHint(result.message ?? "נשמר.");
      if (!form.id) resetForm();
    });
  }

  function saveMissingDrafts() {
    startTransition(async () => {
      const existingKeys = new Set(
        banners.map((b) => `${b.slot}::${b.title.trim()}`),
      );
      const toCreate = BANNER_DRAFTS.filter(
        (d) => !existingKeys.has(`${d.slot}::${d.title.trim()}`),
      );
      if (toCreate.length === 0) {
        setHint("כל התבניות כבר קיימות ברשימה (לפי כותרת+מיקום).");
        return;
      }

      let created = 0;
      const nextBanners = [...banners];
      for (const draft of toCreate) {
        const result = await upsertBanner({
          slot: draft.slot,
          title: draft.title,
          body: draft.body,
          ctaLabel: draft.ctaLabel,
          ctaHref: draft.ctaHref,
          sortOrder: 0,
          isActive: false,
        });
        if (result.ok && result.banner) {
          nextBanners.push(result.banner);
          created += 1;
        }
      }
      setBanners(nextBanners);
      setHint(
        created > 0
          ? `נוספו ${created} באנרים כבויים מתבניות. הפעל אחד לכל מיקום.`
          : "לא נוסף כלום. בדוק הרשאות Studio.",
      );
    });
  }

  return (
    <div className="space-y-10">
      {hint ? (
        <p className="text-sm text-zinc-400" role="status">
          {hint}
        </p>
      ) : null}

      <section className="border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
        <h2 className="text-base font-semibold text-zinc-100">
          איך כותבים באנר
        </h2>
        <ul className="mt-3 list-disc space-y-1.5 pe-5 text-sm text-zinc-400">
          {BANNER_WRITING_TIPS.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-zinc-500">
          {GENERIC_ADD_TIPS[0]} {GENERIC_ADD_TIPS[2]}
        </p>
      </section>

      <section className="border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-zinc-100">
              תבניות מוכנות
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              לחץ &quot;טען לטופס&quot; לעריכה, או הוסף את כולן כטיוטות כבויות.
            </p>
          </div>
          <button
            type="button"
            disabled={pending}
            onClick={saveMissingDrafts}
            className="border border-zinc-500 px-3 py-2 text-xs text-zinc-100 disabled:opacity-50"
          >
            {pending ? "מוסיף..." : "הוסף תבניות חסרות (כבויות)"}
          </button>
        </div>

        <div
          className="mt-4 flex flex-wrap gap-2"
          role="group"
          aria-label="סינון תבניות לפי מיקום"
        >
          <button
            type="button"
            onClick={() => setDraftFilter("all")}
            className={`border px-3 py-1.5 text-xs ${
              draftFilter === "all"
                ? "border-zinc-100 bg-zinc-100 text-zinc-950"
                : "border-zinc-700 text-zinc-300"
            }`}
          >
            הכל
          </button>
          {BANNER_SLOTS.map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => setDraftFilter(slot)}
              className={`border px-3 py-1.5 text-xs ${
                draftFilter === slot
                  ? "border-zinc-100 bg-zinc-100 text-zinc-950"
                  : "border-zinc-700 text-zinc-300"
              }`}
            >
              {SLOT_LABELS[slot]}
            </button>
          ))}
        </div>

        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {visibleDrafts.map((draft) => (
            <li
              key={draft.id}
              className="border border-zinc-800 bg-zinc-950/50 p-4"
            >
              <p className="text-[10px] tracking-wide text-zinc-500">
                {SLOT_LABELS[draft.slot]}
              </p>
              <h3 className="mt-1 text-sm font-semibold text-zinc-100">
                {draft.label}
              </h3>
              <p className="mt-2 text-sm text-zinc-200">{draft.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                {draft.body}
              </p>
              <p className="mt-2 text-[11px] text-zinc-500">
                {draft.ctaLabel} → {draft.ctaHref}
              </p>
              <p className="mt-2 text-[11px] text-zinc-600">{draft.tip}</p>
              <button
                type="button"
                className="mt-3 border border-zinc-600 px-3 py-1.5 text-xs text-zinc-200 hover:border-zinc-400"
                onClick={() => applyDraft(draft)}
              >
                טען לטופס
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
        <h2 className="text-base font-semibold text-zinc-100">
          {form.id ? "עריכת באנר" : "באנר חדש"}
        </h2>
        <p className="mt-1 text-sm text-zinc-400">{slotHint(form.slot)}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-zinc-400">מיקום</span>
            <select
              value={form.slot}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  slot: e.target.value as BannerSlot,
                }))
              }
              className="mt-1 w-full border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            >
              {BANNER_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {SLOT_LABELS[slot]}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-zinc-400">סדר</span>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  sortOrder: Number.parseInt(e.target.value, 10) || 0,
                }))
              }
              className="mt-1 w-full border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="text-zinc-400">כותרת</span>
            <input
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              className="mt-1 w-full border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            />
            <SuggestionChips
              label="הצעות כותרת"
              items={fieldSuggestions.titles}
              onPick={(title) => setForm((f) => ({ ...f, title }))}
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="text-zinc-400">גוף</span>
            <textarea
              value={form.body}
              onChange={(e) =>
                setForm((f) => ({ ...f, body: e.target.value }))
              }
              rows={3}
              className="mt-1 w-full border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            />
            <SuggestionChips
              label="הצעות גוף"
              items={fieldSuggestions.bodies}
              onPick={(body) => setForm((f) => ({ ...f, body }))}
            />
          </label>
          <label className="block text-sm">
            <span className="text-zinc-400">טקסט כפתור</span>
            <input
              value={form.ctaLabel}
              onChange={(e) =>
                setForm((f) => ({ ...f, ctaLabel: e.target.value }))
              }
              className="mt-1 w-full border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            />
            <SuggestionChips
              label="הצעות כפתור"
              items={fieldSuggestions.ctas}
              onPick={(ctaLabel) => setForm((f) => ({ ...f, ctaLabel }))}
            />
          </label>
          <label className="block text-sm">
            <span className="text-zinc-400">קישור כפתור</span>
            <input
              value={form.ctaHref}
              onChange={(e) =>
                setForm((f) => ({ ...f, ctaHref: e.target.value }))
              }
              dir="ltr"
              className="mt-1 w-full border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            />
            <SuggestionChips
              label="קישורים נפוצים"
              items={[
                "/members",
                "/members#login",
                "/paths",
                "/live",
                "/contact",
                "/books",
                "/videos",
              ]}
              onPick={(ctaHref) => setForm((f) => ({ ...f, ctaHref }))}
            />
          </label>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm((f) => ({ ...f, isActive: e.target.checked }))
              }
              className="size-4"
            />
            <span className="text-zinc-300">
              פעיל (מכבה באנרים אחרים באותו מיקום)
            </span>
          </label>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending || !form.title.trim()}
            onClick={saveForm}
            className="border border-zinc-500 px-4 py-2 text-sm text-zinc-100 disabled:opacity-50"
          >
            {pending ? "שומר..." : form.id ? "עדכן" : "צור"}
          </button>
          {form.id ? (
            <button
              type="button"
              onClick={resetForm}
              className="border border-zinc-700 px-4 py-2 text-sm text-zinc-400"
            >
              ביטול
            </button>
          ) : null}
        </div>
      </section>

      {BANNER_SLOTS.map((slot) => {
        const rows = grouped.get(slot) ?? [];
        return (
          <section key={slot}>
            <h2 className="text-base font-semibold text-zinc-100">
              {SLOT_LABELS[slot]} ({rows.length})
            </h2>
            <div className="mt-4 space-y-3">
              {rows.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  אין באנרים. טען תבנית למעלה או לחץ &quot;הוסף תבניות
                  חסרות&quot;.
                </p>
              ) : (
                rows.map((banner) => (
                  <article
                    key={banner.id}
                    className="border border-zinc-800 bg-zinc-900/60 p-5"
                  >
                    <header className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-zinc-50">
                          {banner.title}
                        </h3>
                        <p className="mt-1 text-sm text-zinc-400">
                          {banner.body}
                        </p>
                        {banner.cta_label && banner.cta_href ? (
                          <p className="mt-2 text-xs text-zinc-500">
                            {banner.cta_label} → {banner.cta_href}
                          </p>
                        ) : null}
                      </div>
                      <span
                        className={`text-xs ${
                          banner.is_active
                            ? "text-emerald-400"
                            : "text-zinc-500"
                        }`}
                      >
                        {banner.is_active ? "פעיל" : "כבוי"}
                      </span>
                    </header>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => setForm(bannerToForm(banner))}
                        className="border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300"
                      >
                        ערוך
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => {
                          startTransition(async () => {
                            const result = await setBannerActive(
                              banner.id,
                              !banner.is_active,
                            );
                            if (!result.ok) {
                              setHint(result.error);
                              return;
                            }
                            if (result.banner) {
                              setBanners((prev) =>
                                prev.map((b) => {
                                  if (b.id === result.banner!.id) {
                                    return result.banner!;
                                  }
                                  if (
                                    result.banner!.is_active &&
                                    b.slot === result.banner!.slot
                                  ) {
                                    return { ...b, is_active: false };
                                  }
                                  return b;
                                }),
                              );
                            }
                            setHint(result.message ?? "עודכן.");
                          });
                        }}
                        className="border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300"
                      >
                        {banner.is_active ? "השבת" : "הפעל"}
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => {
                          if (!window.confirm("למחוק את הבאנר?")) {
                            return;
                          }
                          startTransition(async () => {
                            const result = await deleteBanner(banner.id);
                            if (!result.ok) {
                              setHint(result.error);
                              return;
                            }
                            setBanners((prev) =>
                              prev.filter((b) => b.id !== banner.id),
                            );
                            if (form.id === banner.id) resetForm();
                            setHint("נמחק.");
                          });
                        }}
                        className="border border-zinc-800 px-3 py-1.5 text-xs text-zinc-500"
                      >
                        מחק
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
