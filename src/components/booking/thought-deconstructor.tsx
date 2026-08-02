"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  useCallback,
  useMemo,
  useState,
  useTransition,
  type DragEvent,
  type FormEvent,
  type ReactNode,
} from "react";

import { submitLogicFilterLead } from "@/actions/logic-filter-lead";
import { buildSmsHref, buildWhatsAppHref } from "@/lib/whatsapp";

type BucketId = "facts" | "story" | "pool";

type Chip = {
  id: string;
  text: string;
  bucket: BucketId;
};

type ThoughtDeconstructorProps = {
  source?: string;
};

const BOOKING_CTA =
  "עכשיו כשפירקנו את זה, בוא נחקור את זה לעומק. קבע שיחה.";

const fieldClass =
  "mt-2 w-full rounded-none border border-white/15 bg-black px-4 py-3 text-[#FAFAF8] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#D42B2B]";

function splitThought(text: string): string[] {
  return text
    .split(/[\n.!?]+/u)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function makeChips(text: string): Chip[] {
  return splitThought(text).map((chunk, index) => ({
    id: `chip-${index}-${chunk.slice(0, 12)}`,
    text: chunk,
    bucket: "pool" as const,
  }));
}

/**
 * Two-step Thought Deconstructor: write a thought, sort into
 * Objective Facts vs My Story, then book a deep-dive call via Resend.
 */
export function ThoughtDeconstructor({
  source = "thought-deconstructor",
}: ThoughtDeconstructorProps) {
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState<1 | 2>(1);
  const [thought, setThought] = useState("");
  const [chips, setChips] = useState<Chip[]>([]);
  const [factsManual, setFactsManual] = useState("");
  const [storyManual, setStoryManual] = useState("");
  const [showBooking, setShowBooking] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const factsChips = useMemo(
    () => chips.filter((c) => c.bucket === "facts"),
    [chips],
  );
  const storyChips = useMemo(
    () => chips.filter((c) => c.bucket === "story"),
    [chips],
  );
  const poolChips = useMemo(
    () => chips.filter((c) => c.bucket === "pool"),
    [chips],
  );

  const objectiveFacts = useMemo(() => {
    const fromChips = factsChips.map((c) => c.text).join("\n");
    return [fromChips, factsManual.trim()].filter(Boolean).join("\n").trim();
  }, [factsChips, factsManual]);

  const subjectiveStory = useMemo(() => {
    const fromChips = storyChips.map((c) => c.text).join("\n");
    return [fromChips, storyManual.trim()].filter(Boolean).join("\n").trim();
  }, [storyChips, storyManual]);

  const bucketsReady =
    objectiveFacts.length >= 3 && subjectiveStory.length >= 3;

  const moveChip = useCallback((chipId: string, bucket: BucketId) => {
    setChips((prev) =>
      prev.map((chip) =>
        chip.id === chipId ? { ...chip, bucket } : chip,
      ),
    );
  }, []);

  function onContinueFromThought() {
    const trimmed = thought.trim();
    if (trimmed.length < 10) {
      setError("כתוב קצת יותר על המחשבה או הבעיה (לפחות כמה משפטים).");
      return;
    }
    setError("");
    setChips(makeChips(trimmed));
    setFactsManual("");
    setStoryManual("");
    setShowBooking(false);
    setStep(2);
  }

  function onDropBucket(bucket: BucketId, e: DragEvent) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/chip-id") || draggingId;
    if (id) moveChip(id, bucket);
    setDraggingId(null);
  }

  function onBookClick() {
    if (!bucketsReady) {
      setError("מלא את שני הדליים לפני קביעת שיחה.");
      return;
    }
    setError("");
    setShowBooking(true);
  }

  function onSubmitBooking(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("נא למלא שם.");
      return;
    }
    if (phone.trim().length < 5) {
      setError("נא למלא טלפון.");
      return;
    }
    if (email.trim() && !email.trim().includes("@")) {
      setError("אימייל לא תקין (אפשר להשאיר ריק).");
      return;
    }
    if (!bucketsReady) {
      setError("מלא את שני הדליים לפני השליחה.");
      return;
    }

    setError("");
    startTransition(async () => {
      const result = await submitLogicFilterLead({
        situationText: thought.trim(),
        objectiveFacts,
        subjectiveStory,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        source,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess(true);
    });
  }

  if (success) {
    const followUp = [
      "היי יקיר, סיימתי את מפרק המחשבות באתר.",
      `שם: ${name.trim()}`,
      `טלפון: ${phone.trim()}`,
      "",
      "המצב:",
      thought.trim().slice(0, 500),
      "",
      "אשמח לתאם שיחת עומק.",
    ].join("\n");

    return (
      <div
        className="border border-white/10 bg-[#0A0A0B] p-8 text-[#FAFAF8] sm:p-10"
        role="status"
      >
        <p className="text-xs font-medium tracking-wide text-[#D42B2B]">
          נשלח
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">
          הפירוק התקבל.
        </h2>
        <p className="mt-4 max-w-prose leading-relaxed text-[#9CA3AF]">
          העובדות והסיפור כבר בידיים. הדרך המהירה לתיאום: וואטסאפ או SMS (גם
          לטלפון כשר).
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={buildWhatsAppHref(followUp)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            המשך בוואטסאפ
          </a>
          <a href={buildSmsHref(followUp)} className="btn btn-secondary">
            SMS
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-white/10 bg-[#0A0A0B] p-5 text-[#FAFAF8] sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-[#9CA3AF]" aria-live="polite">
          שלב {step} מתוך 2
        </p>
        <ol className="flex gap-2" aria-hidden="true">
          {[1, 2].map((n) => (
            <li
              key={n}
              className={`h-1.5 w-8 rounded-full transition-colors ${
                n <= step ? "bg-[#D42B2B]" : "bg-white/15"
              }`}
            />
          ))}
        </ol>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step-1"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="mt-8"
          >
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
              מה המחשבה או הבעיה עכשיו?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#9CA3AF]">
              כתוב בחופשיות. בלי לסדר. בשלב הבא נפריד עובדה מסיפור.
            </p>
            <label htmlFor="thought-input" className="sr-only">
              המחשבה או הבעיה
            </label>
            <textarea
              id="thought-input"
              rows={8}
              value={thought}
              onChange={(e) => setThought(e.target.value)}
              placeholder="כתוב כאן את מה שמעסיק אותך..."
              className={`${fieldClass} mt-5 min-h-[12rem] resize-y`}
            />
            {error ? (
              <p className="mt-4 text-sm text-[#D42B2B]" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="button"
              onClick={onContinueFromThought}
              className="btn btn-primary mt-6"
            >
              המשך לפירוק
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="step-2"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="mt-8"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  פרק את המחשבה
                </h2>
                <p className="mt-2 max-w-prose text-sm leading-relaxed text-[#9CA3AF]">
                  גרור קטעים לדליים, או לחץ עליהם, או הקלד ידנית בכל צד. ימין:
                  עובדות. שמאל: הסיפור שלך.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setShowBooking(false);
                  setError("");
                }}
                className="text-sm text-[#9CA3AF] underline-offset-4 hover:text-[#FAFAF8] hover:underline"
              >
                חזרה לטקסט
              </button>
            </div>

            {thought.trim() ? (
              <aside className="mt-5 border border-white/10 bg-black/60 p-4 text-sm leading-relaxed text-[#9CA3AF]">
                <p className="text-xs font-medium tracking-wide text-[#D42B2B]">
                  הטקסט המקורי
                </p>
                <p className="mt-2 whitespace-pre-wrap text-[#FAFAF8]/85">
                  {thought.trim()}
                </p>
              </aside>
            ) : null}

            {poolChips.length > 0 ? (
              <div className="mt-6">
                <p className="text-xs font-medium tracking-wide text-[#9CA3AF]">
                  קטעים לפירוק (גרור או לחץ)
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {poolChips.map((chip) => (
                    <li key={chip.id}>
                      <ChipCard
                        chip={chip}
                        onDragStart={setDraggingId}
                        onDragEnd={() => setDraggingId(null)}
                        actions={
                          <>
                            <button
                              type="button"
                              className="text-[10px] text-[#D42B2B]"
                              onClick={() => moveChip(chip.id, "facts")}
                            >
                              לעובדות
                            </button>
                            <button
                              type="button"
                              className="text-[10px] text-[#9CA3AF]"
                              onClick={() => moveChip(chip.id, "story")}
                            >
                              לסיפור
                            </button>
                          </>
                        }
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* RTL: first column = right = facts, second = left = story */}
            <div className="mt-8 grid gap-4 md:grid-cols-2" dir="rtl">
              <Bucket
                title="עובדות אובייקטיביות"
                hint="מה קרה, מתי, מי. בלי פרשנות."
                accent="facts"
                ariaLabel="אזור שחרור לעובדות אובייקטיביות"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => onDropBucket("facts", e)}
              >
                <ul className="min-h-[4rem] space-y-2">
                  <AnimatePresence initial={false}>
                    {factsChips.map((chip) => (
                      <motion.li
                        key={chip.id}
                        layout={!reduceMotion}
                        initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
                      >
                        <ChipCard
                          chip={chip}
                          onDragStart={setDraggingId}
                          onDragEnd={() => setDraggingId(null)}
                          actions={
                            <button
                              type="button"
                              className="text-[10px] text-[#9CA3AF]"
                              onClick={() => moveChip(chip.id, "pool")}
                            >
                              החזר
                            </button>
                          }
                        />
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
                <label htmlFor="facts-manual" className="sr-only">
                  הקלדה ידנית לעובדות
                </label>
                <textarea
                  id="facts-manual"
                  rows={4}
                  value={factsManual}
                  onChange={(e) => setFactsManual(e.target.value)}
                  placeholder="או הקלד כאן עובדות..."
                  className={`${fieldClass} mt-3 min-h-[6rem] resize-y text-sm`}
                />
              </Bucket>

              <Bucket
                title="הסיפור שלי: פרשנות"
                hint="מה אתה חושב שזה אומר. רגש, מסקנה, האשמה."
                accent="story"
                ariaLabel="אזור שחרור לסיפור ולפרשנות"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => onDropBucket("story", e)}
              >
                <ul className="min-h-[4rem] space-y-2">
                  <AnimatePresence initial={false}>
                    {storyChips.map((chip) => (
                      <motion.li
                        key={chip.id}
                        layout={!reduceMotion}
                        initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
                      >
                        <ChipCard
                          chip={chip}
                          onDragStart={setDraggingId}
                          onDragEnd={() => setDraggingId(null)}
                          actions={
                            <button
                              type="button"
                              className="text-[10px] text-[#9CA3AF]"
                              onClick={() => moveChip(chip.id, "pool")}
                            >
                              החזר
                            </button>
                          }
                        />
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
                <label htmlFor="story-manual" className="sr-only">
                  הקלדה ידנית לסיפור
                </label>
                <textarea
                  id="story-manual"
                  rows={4}
                  value={storyManual}
                  onChange={(e) => setStoryManual(e.target.value)}
                  placeholder="או הקלד כאן פרשנות..."
                  className={`${fieldClass} mt-3 min-h-[6rem] resize-y text-sm`}
                />
              </Bucket>
            </div>

            {error ? (
              <p className="mt-6 text-sm text-[#D42B2B]" role="alert">
                {error}
              </p>
            ) : null}

            <AnimatePresence>
              {bucketsReady ? (
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0 }}
                  className="mt-8 border border-[#D42B2B]/40 bg-black/40 p-5"
                >
                  {!showBooking ? (
                    <button
                      type="button"
                      onClick={onBookClick}
                      className="btn btn-primary w-full text-center sm:w-auto"
                    >
                      {BOOKING_CTA}
                    </button>
                  ) : (
                    <form onSubmit={onSubmitBooking} className="space-y-4" noValidate>
                      <p className="text-sm leading-relaxed text-[#9CA3AF]">
                        השאר פרטים. הפירוק (עובדות + סיפור) יישלח למאמן לפני
                        השיחה.
                      </p>
                      <div>
                        <label htmlFor="td-name" className="block text-sm text-[#9CA3AF]">
                          שם
                        </label>
                        <input
                          id="td-name"
                          type="text"
                          autoComplete="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={fieldClass}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="td-phone" className="block text-sm text-[#9CA3AF]">
                          טלפון
                        </label>
                        <input
                          id="td-phone"
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
                        <label htmlFor="td-email" className="block text-sm text-[#9CA3AF]">
                          אימייל (אופציונלי)
                        </label>
                        <input
                          id="td-email"
                          type="email"
                          autoComplete="email"
                          inputMode="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={fieldClass}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={pending}
                        className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {pending ? "שולח..." : "שלח וקבע שיחה"}
                      </button>
                    </form>
                  )}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Bucket({
  title,
  hint,
  accent,
  ariaLabel,
  children,
  onDragOver,
  onDrop,
}: {
  title: string;
  hint: string;
  accent: "facts" | "story";
  ariaLabel: string;
  children: ReactNode;
  onDragOver: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
}) {
  return (
    <div
      role="region"
      aria-label={ariaLabel}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`border p-4 transition ${
        accent === "facts"
          ? "border-[#D42B2B]/50 bg-black/50"
          : "border-white/15 bg-black/30"
      }`}
    >
      <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-[#9CA3AF]">{hint}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function ChipCard({
  chip,
  actions,
  onDragStart,
  onDragEnd,
}: {
  chip: Chip;
  actions?: ReactNode;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/chip-id", chip.id);
        e.dataTransfer.effectAllowed = "move";
        onDragStart(chip.id);
      }}
      onDragEnd={onDragEnd}
      className="cursor-grab border border-white/15 bg-[#111] px-3 py-2 active:cursor-grabbing"
    >
      <p className="text-sm leading-relaxed text-[#FAFAF8]">{chip.text}</p>
      {actions ? (
        <div className="mt-2 flex flex-wrap gap-3">{actions}</div>
      ) : null}
    </div>
  );
}

export default ThoughtDeconstructor;
