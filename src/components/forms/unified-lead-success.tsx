import { buildWhatsAppHref } from "@/lib/whatsapp";

type UnifiedLeadSuccessProps = {
  /** Prefill for the WhatsApp backup button. */
  whatsappText?: string;
  /** Optional dark surface (booking / paths dialogs). */
  tone?: "light" | "dark";
};

const DEFAULT_TEXT =
  "היי יקיר, שלחתי פרטים באתר. אשמח להמשיך תיאום.";

/**
 * Shared post-submit state for booking / path / contact forms.
 */
export function UnifiedLeadSuccess({
  whatsappText = DEFAULT_TEXT,
  tone = "light",
}: UnifiedLeadSuccessProps) {
  const isDark = tone === "dark";
  const href = buildWhatsAppHref(whatsappText);

  return (
    <div
      className={
        isDark
          ? "border border-white/10 bg-[#0A0A0B] p-8 text-[#FAFAF8] sm:p-10"
          : "border border-foreground/15 bg-paper p-8"
      }
      role="status"
    >
      <p
        className={
          isDark
            ? "text-sm leading-relaxed text-[#FAFAF8]"
            : "text-sm leading-relaxed text-foreground"
        }
      >
        הנתונים נקלטו במערכת. מעבר להמשך תיאום מול יקיר...
      </p>
      <div className="mt-6">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
        >
          המשך בוואטסאפ
        </a>
      </div>
    </div>
  );
}
