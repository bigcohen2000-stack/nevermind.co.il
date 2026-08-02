"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { approveQuote } from "@/actions/public-quote";

type QuoteApproveButtonProps = {
  token: string;
};

export function QuoteApproveButton({ token }: QuoteApproveButtonProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="mt-8">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            setError(null);
            const result = await approveQuote(token);
            if (!result.ok) {
              setError(result.error);
              return;
            }
            setMessage(result.message ?? "ההצעה אושרה.");
            router.refresh();
          });
        }}
        className="btn btn-primary disabled:opacity-50"
      >
        {pending ? "מאשר..." : "אישור ההצעה"}
      </button>
      {message ? (
        <p className="mt-3 text-sm text-foreground/80" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mt-3 text-sm text-action" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
