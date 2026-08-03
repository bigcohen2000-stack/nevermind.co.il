"use client";

import { downloadCsv, rowsToCsv } from "@/lib/studio/export-csv";

type StudioCsvExportButtonProps = {
  filename: string;
  headers: string[];
  rows: Array<Array<string | number | null | undefined>>;
  label?: string;
};

export function StudioCsvExportButton({
  filename,
  headers,
  rows,
  label = "ייצוא CSV",
}: StudioCsvExportButtonProps) {
  return (
    <button
      type="button"
      className="inline-flex min-h-10 items-center border border-zinc-600 px-3 py-1.5 text-xs text-zinc-200 transition hover:border-zinc-400 disabled:opacity-40"
      onClick={() => {
        downloadCsv(filename, rowsToCsv(headers, rows));
      }}
      disabled={rows.length === 0}
    >
      {label}
    </button>
  );
}
