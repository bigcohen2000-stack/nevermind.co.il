"use client";

import { useMemo, useState, useTransition } from "react";

import { submitBookingLead } from "@/actions/booking-lead";
import { UnifiedLeadSuccess } from "@/components/forms/unified-lead-success";
import {
  buildLeadWhatsAppText,
  CONTACT_INTERESTS,
  LEAD_SOURCE_LABELS,
  type PathId,
} from "@/lib/content/offers";
import { buildSmsHref, buildWhatsAppHref } from "@/lib/whatsapp";

type ContactLeadFormProps = {
  /** Query param `from` value, e.g. mobile-cta */
  source?: string;
};

export function ContactLeadForm({ source }: ContactLeadFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState<PathId>("unsure");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [pending, startTransition] = useTransition();

  const interestLabel = useMemo(
    () =>
      CONTACT_INTERESTS.find((item) => item.id === interest)?.label ??
      "עדיין לא בטוח - בוא נדבר",
    [interest],
  );

  const sourceLabel = useMemo(() => {
    if (!source) return undefined;
    return LEAD_SOURCE_LABELS[source] ?? source;
  }, [source]);

  if (emailSent) {
    return (
      <UnifiedLeadSuccess
        whatsappText={buildLeadWhatsAppText({
          name: name.trim() || "אורח",
          phone: phone.trim() || "-",
          interestLabel,
          message,
          source: sourceLabel,
        })}
      />
    );
  }

  function persistLead(channel: "whatsapp" | "sms") {
    const contextParts = [
      interestLabel,
      message.trim() || null,
      sourceLabel ? `מקור: ${sourceLabel}` : null,
      `ערוץ: ${channel}`,
    ].filter(Boolean);

    void submitBookingLead({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      context: contextParts.join(" | "),
      source: source
        ? `contact-${source}-${channel}`
        : `contact-${channel}`,
    });
  }

  function onWhatsApp(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    if (!trimmedName || !trimmedPhone) {
      setError("נא למלא שם וטלפון.");
      return;
    }
    setError("");
    persistLead("whatsapp");
    const text = buildLeadWhatsAppText({
      name: trimmedName,
      phone: trimmedPhone,
      interestLabel,
      message,
      source: sourceLabel,
    });
    window.open(buildWhatsAppHref(text), "_blank", "noopener,noreferrer");
  }

  function onSms() {
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    if (!trimmedName || !trimmedPhone) {
      setError("נא למלא שם וטלפון.");
      return;
    }
    setError("");
    persistLead("sms");
    const text = buildLeadWhatsAppText({
      name: trimmedName,
      phone: trimmedPhone,
      interestLabel,
      message,
      source: sourceLabel,
    });
    window.location.href = buildSmsHref(text);
  }

  function onEmail() {
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName || !trimmedPhone || !trimmedEmail) {
      setError("לשליחה במייל נדרשים שם, טלפון ואימייל.");
      return;
    }
    setError("");
    setEmailSent(false);

    const contextParts = [
      interestLabel,
      message.trim() || null,
      sourceLabel ? `מקור: ${sourceLabel}` : null,
    ].filter(Boolean);

    startTransition(async () => {
      const result = await submitBookingLead({
        name: trimmedName,
        phone: trimmedPhone,
        email: trimmedEmail,
        context: contextParts.join(" | "),
        source: source ? `contact-${source}` : "contact",
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setEmailSent(true);
    });
  }

  return (
    <form onSubmit={onWhatsApp} className="space-y-5" noValidate>
      {sourceLabel ? (
        <p className="text-sm text-foreground/65">הגעת מ: {sourceLabel}</p>
      ) : null}

      <div>
        <label htmlFor="lead-name" className="block text-sm font-medium">
          שם
        </label>
        <input
          id="lead-name"
          name="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-2 w-full rounded-[var(--radius-btn)] border border-foreground/15 bg-background px-4 py-3 text-foreground outline-none transition-colors focus:border-action"
        />
      </div>

      <div>
        <label htmlFor="lead-phone" className="block text-sm font-medium">
          טלפון
        </label>
        <input
          id="lead-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-2 w-full rounded-[var(--radius-btn)] border border-foreground/15 bg-background px-4 py-3 text-foreground outline-none transition-colors focus:border-action"
        />
      </div>

      <div>
        <label htmlFor="lead-email" className="block text-sm font-medium">
          אימייל (אופציונלי)
        </label>
        <input
          id="lead-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full rounded-[var(--radius-btn)] border border-foreground/15 bg-background px-4 py-3 text-foreground outline-none transition-colors focus:border-action"
        />
      </div>

      <div>
        <label htmlFor="lead-interest" className="block text-sm font-medium">
          מה מעניין אותך?
        </label>
        <select
          id="lead-interest"
          name="interest"
          value={interest}
          onChange={(e) => setInterest(e.target.value as PathId)}
          className="mt-2 w-full rounded-[var(--radius-btn)] border border-foreground/15 bg-background px-4 py-3 text-foreground outline-none transition-colors focus:border-action"
        >
          {CONTACT_INTERESTS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="lead-message" className="block text-sm font-medium">
          מה קורה? (לא חובה)
        </label>
        <textarea
          id="lead-message"
          name="message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-2 w-full resize-y rounded-[var(--radius-btn)] border border-foreground/15 bg-background px-4 py-3 text-foreground outline-none transition-colors focus:border-action"
        />
      </div>

      {error ? (
        <p className="text-sm text-action" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button type="submit" className="btn btn-primary w-full sm:w-auto">
          המשך בוואטסאפ
        </button>
        <button
          type="button"
          onClick={onSms}
          className="btn btn-secondary w-full sm:w-auto"
        >
          שלח ב-SMS
        </button>
        <button
          type="button"
          onClick={onEmail}
          disabled={pending}
          className="btn btn-secondary w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "שולח..." : "שלח במייל"}
        </button>
      </div>

      <p className="text-sm leading-relaxed text-foreground/65">
        וואטסאפ או SMS נפתחים עם ההודעה מוכנה (גם לטלפון כשר). מייל הוא גיבוי
        בלבד.
      </p>
    </form>
  );
}
