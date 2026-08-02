"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { submitViewerFeedback } from "@/actions/viewer-feedback";

type FeedbackKind = "dislike" | "reply_request";

type ViewerFeedbackFormProps = {
  videoId?: string;
  videoTitle: string;
};

export function ViewerFeedbackForm({
  videoId,
  videoTitle,
}: ViewerFeedbackFormProps) {
  const [kind, setKind] = useState<FeedbackKind>("reply_request");
  const [body, setBody] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [wantReply, setWantReply] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [whatsappHref, setWhatsappHref] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();

  if (submitted) {
    return (
      <div className="space-y-3 text-sm">
        <p className="font-medium text-foreground">תודה. קיבלנו את המשוב.</p>
        <p className="text-muted">
          אם ביקשתם תשובה, נחזור אליכם בהקדם האפשרי.
        </p>
        {whatsappHref ? (
          <Link
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary inline-flex"
          >
            שליחה בוואטסאפ (אופציונלי)
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const result = await submitViewerFeedback({
            kind,
            body,
            videoId,
            videoTitle,
            name: name.trim() || undefined,
            phone: phone.trim() || undefined,
            email: email.trim() || undefined,
            wantReply: kind === "reply_request" ? true : wantReply,
          });
          if (!result.ok) {
            setError(result.error);
            return;
          }
          setWhatsappHref(result.whatsappHref);
          setSubmitted(true);
        });
      }}
    >
      <fieldset className="space-y-2">
        <legend className="sr-only">סוג משוב</legend>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { value: "reply_request" as const, label: "רוצה תשובה" },
              { value: "dislike" as const, label: "לא אהבתי" },
            ] as const
          ).map((opt) => (
            <label
              key={opt.value}
              className={`cursor-pointer border px-3 py-2 text-xs transition ${
                kind === opt.value
                  ? "border-action bg-action/10 text-foreground"
                  : "border-foreground/15 text-muted hover:border-foreground/30"
              }`}
            >
              <input
                type="radio"
                name="feedback-kind"
                value={opt.value}
                checked={kind === opt.value}
                onChange={() => setKind(opt.value)}
                className="sr-only"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="feedback-body" className="block text-sm text-muted">
          {kind === "dislike" ? "מה לא עבד?" : "מה תרצו לשאול?"}
        </label>
        <textarea
          id="feedback-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          required
          disabled={pending}
          className="mt-1.5 w-full border border-foreground/15 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-action/60 disabled:opacity-60"
          placeholder="כמה משפטים. בלי דרמה."
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="feedback-name" className="block text-xs text-muted">
            שם (אופציונלי)
          </label>
          <input
            id="feedback-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={pending}
            className="mt-1 w-full border border-foreground/15 bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="feedback-phone" className="block text-xs text-muted">
            טלפון (אופציונלי)
          </label>
          <input
            id="feedback-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={pending}
            dir="ltr"
            className="mt-1 w-full border border-foreground/15 bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="feedback-email" className="block text-xs text-muted">
          אימייל (אופציונלי)
        </label>
        <input
          id="feedback-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={pending}
          dir="ltr"
          className="mt-1 w-full border border-foreground/15 bg-background px-3 py-2 text-sm"
        />
      </div>

      {kind === "dislike" ? (
        <label className="flex items-center gap-2 text-xs text-muted">
          <input
            type="checkbox"
            checked={wantReply}
            onChange={(e) => setWantReply(e.target.checked)}
            disabled={pending}
          />
          רוצה שיחזרו אליי
        </label>
      ) : null}

      {error ? <p className="text-sm text-action">{error}</p> : null}

      <button
        type="submit"
        disabled={pending || !body.trim()}
        className="btn btn-secondary disabled:opacity-50"
      >
        {pending ? "שולחים..." : "שליחת משוב"}
      </button>
    </form>
  );
}
