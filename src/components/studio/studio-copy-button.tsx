"use client";

type StudioCopyButtonProps = {
  text: string;
  label?: string;
  onCopied?: () => void;
  className?: string;
  disabled?: boolean;
};

export function StudioCopyButton({
  text,
  label = "העתק",
  onCopied,
  className,
  disabled,
}: StudioCopyButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || !text.trim()}
      className={
        className ??
        "inline-flex min-h-10 items-center border border-zinc-600 px-3 text-xs text-zinc-200 transition hover:border-zinc-400 disabled:opacity-40"
      }
      onClick={() => {
        void navigator.clipboard.writeText(text).then(() => {
          onCopied?.();
        });
      }}
    >
      {label}
    </button>
  );
}
