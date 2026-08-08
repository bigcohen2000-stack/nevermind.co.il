"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  upsertStudioClubAsset,
  type StudioClubAsset,
} from "@/actions/club-assets";

type StudioClubAssetsPanelProps = {
  items: StudioClubAsset[];
};

/**
 * Minimal Studio CRUD for club vault metadata.
 * Upload files separately to Storage bucket `club-assets`, then register path here.
 */
export function StudioClubAssetsPanel({
  items: initial,
}: StudioClubAssetsPanelProps) {
  const router = useRouter();
  const [items] = useState(initial);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [storagePath, setStoragePath] = useState("");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-6" dir="rtl">
      <p className="text-sm text-zinc-400">
        מעלים קובץ ל-Storage bucket בשם club-assets, ואז רושמים כאן את הנתיב
        והכותרת. ההורדה ללקוח דרך URL חתום קצר-חיים.
      </p>

      <form
        className="space-y-3 border border-zinc-800 bg-zinc-950/50 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          startTransition(async () => {
            const result = await upsertStudioClubAsset({
              title,
              description,
              storagePath,
              fileName: fileName || storagePath.split("/").pop() || "file",
              isPublished: true,
            });
            if (!result.ok) {
              setError(result.error);
              return;
            }
            setTitle("");
            setDescription("");
            setStoragePath("");
            setFileName("");
            router.refresh();
          });
        }}
      >
        <input
          className="w-full border border-zinc-700 bg-transparent px-3 py-2 text-sm"
          placeholder="כותרת"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          className="w-full border border-zinc-700 bg-transparent px-3 py-2 text-sm"
          placeholder="תיאור (אופציונלי)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          className="w-full border border-zinc-700 bg-transparent px-3 py-2 text-sm"
          placeholder="storage path (למשל templates/logic.pdf)"
          value={storagePath}
          onChange={(e) => setStoragePath(e.target.value)}
          required
          dir="ltr"
        />
        <input
          className="w-full border border-zinc-700 bg-transparent px-3 py-2 text-sm"
          placeholder="שם קובץ להצגה"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          dir="ltr"
        />
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="border border-zinc-600 px-3 py-1.5 text-xs text-zinc-200 disabled:opacity-50"
        >
          הוספת נכס
        </button>
      </form>

      {items.length === 0 ? (
        <p className="text-sm text-zinc-500">אין נכסים עדיין.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {items.map((item) => (
            <li key={item.id} className="border border-zinc-800 p-3">
              <p className="font-medium text-zinc-200">{item.title}</p>
              <p className="mt-1 text-xs text-zinc-500" dir="ltr">
                {item.storagePath}
              </p>
              <p className="mt-1 text-xs text-zinc-600">
                {item.isPublished ? "מפורסם" : "מוסתר"} · {item.fileName}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
