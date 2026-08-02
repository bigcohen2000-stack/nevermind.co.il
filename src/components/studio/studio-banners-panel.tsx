"use client";

import { useMemo, useState, useTransition } from "react";

import {
  deleteBanner,
  setBannerActive,
  upsertBanner,
} from "@/actions/studio-banners";
import {
  BANNER_SLOTS,
  SLOT_LABELS,
  type BannerSlot,
} from "@/lib/studio/banners-shared";
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

export function StudioBannersPanel({
  initialBanners,
}: StudioBannersPanelProps) {
  const [banners, setBanners] = useState(initialBanners);
  const [form, setForm] = useState<BannerFormState>(EMPTY_FORM);
  const [hint, setHint] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

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

  function resetForm() {
    setForm(EMPTY_FORM);
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

  return (
    <div className="space-y-10">
      {hint ? (
        <p className="text-sm text-zinc-400" role="status">
          {hint}
        </p>
      ) : null}

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
        <h2 className="text-base font-semibold text-zinc-100">
          {form.id ? "עריכת באנר" : "באנר חדש"}
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          מומלץ באנר פעיל אחד לכל מיקום. הפעלה מכבה את האחרים באותו slot.
        </p>

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
            <span className="text-zinc-300">פעיל</span>
          </label>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending}
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
                <p className="text-sm text-zinc-500">אין באנרים.</p>
              ) : (
                rows.map((banner) => (
                  <article
                    key={banner.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5"
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
                          if (
                            !window.confirm("למחוק את הבאנר?")
                          ) {
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
