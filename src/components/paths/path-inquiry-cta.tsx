"use client";

import { useId, useState, useTransition, type FormEvent } from "react";

import { submitBookingLead } from "@/actions/booking-lead";
import { UnifiedLeadSuccess } from "@/components/forms/unified-lead-success";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  buildTrackWhatsAppText,
  type TrackWhatsAppInput,
} from "@/lib/content/offers";
import { cn } from "@/lib/utils";
import { buildSmsHref, buildWhatsAppHref } from "@/lib/whatsapp";

type PathInquiryCtaProps = {
  label: string;
  track: string;
  priceBeforeVat?: string;
  detail?: string;
  requiresFitCall?: boolean;
  showSms?: boolean;
  source?: string;
  tone?: "light" | "dark";
  className?: string;
};

const primaryBtnClass =
  "inline-flex min-h-12 w-full items-center justify-center rounded-none border border-[#D42B2B] bg-[#D42B2B] px-5 py-3 text-sm font-medium text-white shadow-none transition hover:bg-[#B82424] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D42B2B] disabled:opacity-60 sm:w-auto";

const secondaryBtnLight =
  "inline-flex min-h-12 w-full items-center justify-center rounded-none border border-[#1A1A1A] bg-transparent px-5 py-3 text-sm font-medium text-[#1A1A1A] shadow-none transition hover:bg-[#1A1A1A]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A1A1A] disabled:opacity-60 sm:w-auto";

const secondaryBtnDark =
  "inline-flex min-h-12 w-full items-center justify-center rounded-none border border-[#FAFAF8] bg-transparent px-5 py-3 text-sm font-medium text-[#FAFAF8] shadow-none transition hover:bg-[#FAFAF8]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FAFAF8] disabled:opacity-60 sm:w-auto";

const fieldClass =
  "mt-1.5 w-full border border-[#FAFAF8]/25 bg-black px-3 py-2.5 text-sm text-[#FAFAF8] outline-none transition placeholder:text-[#9CA3AF] focus-visible:border-action focus-visible:ring-2 focus-visible:ring-action";

/**
 * Paths CTA: fill name / phone / purpose, then WhatsApp, SMS, or email.
 */
export function PathInquiryCta({
  label,
  track,
  priceBeforeVat,
  detail,
  requiresFitCall = true,
  showSms = true,
  source = "paths",
  tone = "light",
  className,
}: PathInquiryCtaProps) {
  const formId = useId();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [purpose, setPurpose] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [pending, startTransition] = useTransition();

  const openTriggerClass = tone === "dark" ? secondaryBtnDark : primaryBtnClass;

  function trackInput(): TrackWhatsAppInput {
    return {
      track,
      priceBeforeVat,
      detail,
      requiresFitCall,
      name,
      phone,
      purpose,
    };
  }

  function validateContact(requireEmail: boolean): boolean {
    if (!name.trim() || !phone.trim()) {
      setError("נא למלא שם וטלפון.");
      return false;
    }
    if (requireEmail && !email.trim()) {
      setError("לשליחה במייל נדרש גם אימייל.");
      return false;
    }
    if (!purpose.trim()) {
      setError("נא לכתוב במשפט אחד למה אתם פונים.");
      return false;
    }
    setError("");
    return true;
  }

  function openChannel(kind: "whatsapp" | "sms") {
    if (!validateContact(false)) return;
    const message = buildTrackWhatsAppText(trackInput());
    const context = [
      track,
      priceBeforeVat ? `מחיר לפני מע"מ: ${priceBeforeVat}` : null,
      detail?.trim() || null,
      `מטרה: ${purpose.trim()}`,
      `ערוץ: ${kind}`,
    ]
      .filter(Boolean)
      .join(" | ");

    void submitBookingLead({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      context,
      source: `paths-${source}-${kind}`,
    });

    setStatus(
      kind === "whatsapp"
        ? "הבקשה נקלטה. פותח וואטסאפ."
        : "הבקשה נקלטה. פותח SMS.",
    );
    const href =
      kind === "whatsapp"
        ? buildWhatsAppHref(message)
        : buildSmsHref(message);
    window.setTimeout(() => {
      if (kind === "whatsapp") {
        window.open(href, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = href;
      }
    }, 250);
  }

  function onEmail(e: FormEvent) {
    e.preventDefault();
    if (!validateContact(true)) return;
    setStatus("");
    const context = [
      track,
      priceBeforeVat ? `מחיר לפני מע"מ: ${priceBeforeVat}` : null,
      detail?.trim() || null,
      `מטרה: ${purpose.trim()}`,
    ]
      .filter(Boolean)
      .join(" | ");

    startTransition(async () => {
      const result = await submitBookingLead({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        context,
        source: `paths-${source}`,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setEmailSent(true);
      setStatus("");
    });
  }

  return (
    <div className={cn(className)}>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setError("");
          setStatus("");
          setEmailSent(false);
        }}
        className={openTriggerClass}
      >
        {label}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-md border-[#FAFAF8]/20 bg-[#0A0A0B] text-[#FAFAF8] text-start"
          dir="rtl"
        >
          <DialogHeader>
            <DialogTitle className="text-[#FAFAF8]">{label}</DialogTitle>
            <DialogDescription className="text-[#9CA3AF]">
              ממלאים פרטים. אחר כך שולחים בוואטסאפ או במייל עם המסלול והמחיר
              כבר בפנים. אין סליקה באתר.
            </DialogDescription>
          </DialogHeader>

          {emailSent ? (
            <div className="mt-4">
              <UnifiedLeadSuccess
                tone="dark"
                whatsappText={buildTrackWhatsAppText(trackInput())}
              />
            </div>
          ) : (
            <>
          <div className="mt-4 border border-[#FAFAF8]/15 bg-black/40 px-3 py-3 text-sm">
            <p className="text-[#9CA3AF]">מבקשים</p>
            <p className="mt-1 font-medium text-[#FAFAF8]">{track}</p>
            {priceBeforeVat ? (
              <p className="mt-1 text-[#9CA3AF]">
                מסגרת מחיר: {priceBeforeVat} לפני מע&quot;מ
              </p>
            ) : null}
            {detail ? (
              <p className="mt-1 text-[#9CA3AF]">{detail}</p>
            ) : null}
          </div>

          <form
            id={formId}
            className="mt-5 space-y-4"
            onSubmit={onEmail}
            noValidate
          >
            <div>
              <label htmlFor={`${formId}-name`} className="text-sm text-[#FAFAF8]">
                שם מלא
              </label>
              <input
                id={`${formId}-name`}
                name="name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={fieldClass}
                required
              />
            </div>
            <div>
              <label
                htmlFor={`${formId}-phone`}
                className="text-sm text-[#FAFAF8]"
              >
                טלפון
              </label>
              <input
                id={`${formId}-phone`}
                name="phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={fieldClass}
                required
              />
            </div>
            <div>
              <label
                htmlFor={`${formId}-email`}
                className="text-sm text-[#FAFAF8]"
              >
                אימייל (לשליחה במייל)
              </label>
              <input
                id={`${formId}-email`}
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={fieldClass}
              />
            </div>
            <div>
              <label
                htmlFor={`${formId}-purpose`}
                className="text-sm text-[#FAFAF8]"
              >
                מטרת הפנייה (משפט אחד)
              </label>
              <textarea
                id={`${formId}-purpose`}
                name="purpose"
                rows={3}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className={fieldClass}
                placeholder="למשל: פירוק ויכוח שחוזר בזוגיות."
                required
              />
            </div>

            {error ? (
              <p className="text-sm text-[#D42B2B]" role="alert">
                {error}
              </p>
            ) : null}
            {status ? (
              <p className="text-sm text-[#9CA3AF]" role="status">
                {status}
              </p>
            ) : null}

            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={() => openChannel("whatsapp")}
                disabled={pending}
                className={primaryBtnClass}
              >
                שליחה בוואטסאפ
              </button>
              {showSms ? (
                <button
                  type="button"
                  onClick={() => openChannel("sms")}
                  disabled={pending}
                  className={secondaryBtnLight}
                >
                  SMS רגיל
                </button>
              ) : null}
              <button
                type="submit"
                disabled={pending}
                className={secondaryBtnLight}
              >
                {pending ? "שולח מייל..." : "שליחה במייל"}
              </button>
            </div>
          </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
