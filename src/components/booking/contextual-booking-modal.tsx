"use client";

import { useState, useTransition, type FormEvent } from "react";

import { submitBookingLead } from "@/actions/booking-lead";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ContextualBookingModalProps = {
  /** Video title or search query to pre-fill as context. */
  context: string;
  source?: string;
  triggerLabel?: string;
  /** Controlled open state (optional). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** When false, render only the dialog (trigger provided by parent). */
  showTrigger?: boolean;
};

const fieldClass =
  "mt-2 w-full rounded-none border border-white/15 bg-black px-4 py-3 text-[#FAFAF8] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#D42B2B]";

export function ContextualBookingModal({
  context,
  source = "booking-modal",
  triggerLabel = "לתיאום פגישה",
  open: controlledOpen,
  onOpenChange,
  showTrigger = true,
}: ContextualBookingModalProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleOpenChange(next: boolean) {
    if (!next) {
      setError("");
      setSuccess(false);
    }
    setOpen(next);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    startTransition(async () => {
      const result = await submitBookingLead({
        name,
        phone,
        email,
        context,
        source,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setSuccess(true);
      setName("");
      setPhone("");
      setEmail("");
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {showTrigger ? (
        <DialogTrigger asChild>
          <button type="button" className="btn btn-primary mt-6">
            {triggerLabel}
          </button>
        </DialogTrigger>
      ) : null}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>תיאום שיחת עומק</DialogTitle>
          <DialogDescription>
            פרטים קצרים. נחזור אליך לתיאום. ההקשר מהאתר נשמר אוטומטית.
          </DialogDescription>
          <p
            className="mt-3 text-sm leading-relaxed text-[#9CA3AF]"
            data-ai-hint="key-claim"
          >
            זה לא טיפול. זה פירוק לוגי.
          </p>
        </DialogHeader>

        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          <input type="hidden" name="context" value={context} readOnly />
          <input type="hidden" name="source" value={source} readOnly />

          <div>
            <label htmlFor="booking-context" className="block text-sm text-[#9CA3AF]">
              הקשר
            </label>
            <textarea
              id="booking-context"
              name="contextVisible"
              value={context}
              readOnly
              rows={2}
              className={`${fieldClass} resize-none text-[#9CA3AF]`}
              aria-label="הקשר מהעמוד"
            />
          </div>

          <div>
            <label htmlFor="booking-name" className="block text-sm text-[#9CA3AF]">
              שם
            </label>
            <input
              id="booking-name"
              name="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={fieldClass}
              required
            />
          </div>

          <div>
            <label htmlFor="booking-phone" className="block text-sm text-[#9CA3AF]">
              טלפון
            </label>
            <input
              id="booking-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={fieldClass}
              required
            />
          </div>

          <div>
            <label htmlFor="booking-email" className="block text-sm text-[#9CA3AF]">
              אימייל
            </label>
            <input
              id="booking-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass}
              required
            />
          </div>

          {error ? (
            <p className="text-sm text-[#D42B2B]" role="alert">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="text-sm text-emerald-400" role="status">
              נשלח. נחזור אליך בהקדם.
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending || success}
            className="inline-flex min-h-12 w-full items-center justify-center bg-[#D42B2B] px-4 text-sm font-semibold text-[#FAFAF8] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "שולח..." : success ? "נשלח" : "שלח בקשה"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
