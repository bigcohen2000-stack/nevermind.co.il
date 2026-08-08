"use client";

import { useState, useTransition } from "react";

import {
  createClubAssetDownloadUrl,
  type ClubAssetPublic,
} from "@/actions/club-assets";

type ClubVaultListProps = {
  assets: ClubAssetPublic[];
};

function formatBytes(n: number | null): string {
  if (!n || n <= 0) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function ClubVaultList({ assets }: ClubVaultListProps) {
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (assets.length === 0) {
    return (
      <p className="mt-6 text-sm text-zinc-400">
        עדיין אין קבצים בכספת. יקירי מעלה כאן תבניות ומפרטים לחברי מועדון.
      </p>
    );
  }

  return (
    <div className="mt-8">
      {error ? <p className="mb-4 text-sm text-red-400">{error}</p> : null}
      <ul className="divide-y divide-zinc-800 border border-zinc-800">
        {assets.map((asset) => (
          <li
            key={asset.id}
            className="flex flex-wrap items-start justify-between gap-3 p-4"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium text-zinc-100">{asset.title}</p>
              {asset.description ? (
                <p className="mt-1 text-sm text-zinc-500">{asset.description}</p>
              ) : null}
              <p className="mt-2 text-xs text-zinc-600">
                {asset.fileName}
                {asset.byteSize ? ` · ${formatBytes(asset.byteSize)}` : ""}
              </p>
            </div>
            <button
              type="button"
              disabled={pending && pendingId === asset.id}
              className="btn btn-secondary text-sm"
              onClick={() => {
                setError(null);
                setPendingId(asset.id);
                startTransition(async () => {
                  const result = await createClubAssetDownloadUrl(asset.id);
                  setPendingId(null);
                  if (!result.ok) {
                    setError(result.error);
                    return;
                  }
                  window.open(result.url, "_blank", "noopener,noreferrer");
                });
              }}
            >
              הורדה
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
