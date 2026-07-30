"use client";

import { useMemo, useState } from "react";

import {
  buildLeadWhatsAppText,
  CONTACT_INTERESTS,
  type PathId,
} from "@/lib/content/offers";
import { buildWhatsAppHref } from "@/lib/whatsapp";

export function ContactLeadForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [interest, setInterest] = useState<PathId>("unsure");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const interestLabel = useMemo(
    () =>
      CONTACT_INTERESTS.find((item) => item.id === interest)?.label ??
      "עדיין לא בטוח - בוא נדבר",
    [interest],
  );

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    if (!trimmedName || !trimmedPhone) {
      setError("נא למלא שם וטלפון.");
      return;
    }
    setError("");
    const text = buildLeadWhatsAppText({
      name: trimmedName,
      phone: trimmedPhone,
      interestLabel,
      message,
    });
    window.open(buildWhatsAppHref(text), "_blank", "noopener,noreferrer");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
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

      <button type="submit" className="btn btn-primary w-full sm:w-auto">
        בוא נבדוק יחד
      </button>

      <p className="text-sm leading-relaxed text-foreground/65">
        הפרטים נפתחים ישירות בוואטסאפ. לא נשמרים בשרת האתר.
      </p>
    </form>
  );
}
