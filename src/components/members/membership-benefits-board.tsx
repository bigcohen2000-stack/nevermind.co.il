import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Check,
  FileSearch,
  Gauge,
  Headphones,
  Layers,
  Library,
  Lock,
  MessageCircle,
  Minus,
  PenLine,
  Phone,
  Play,
  Rss,
  Search,
  Shield,
  Sparkles,
  Star,
  Timer,
  UserRound,
} from "lucide-react";

import { MemberOffersStrip } from "@/components/members/member-offers-strip";
import { PathInquiryCta } from "@/components/paths/path-inquiry-cta";
import {
  ACCESS_LAYER_LABELS,
  MEMBERSHIP_COMPARE_ROWS,
  MEMBERSHIP_HIGHLIGHTS,
  type MembershipCompareRow,
} from "@/lib/content/access-layers";
import {
  ARCHIVE_PRICING_ROWS,
  DEFAULT_ARCHIVE_PRICING_ID,
  NO_AUTO_CHECKOUT_NOTE,
  REFUND_POLICY_NOTE,
  RESPONSE_SLA_NOTE,
  VAT_FOOTER_NOTE,
} from "@/lib/content/offers";
import { cn } from "@/lib/utils";

type MembershipBenefitsBoardProps = {
  /** When true, archive CTAs become entry links. */
  isMember?: boolean;
  /** Show post-login offer cards above the compare table. */
  showOffers?: boolean;
  /** When false, omit inline price frames (e.g. /members uses MembersPricing). */
  showPricing?: boolean;
  /** Surface: paths page vs members page copy tweaks. */
  surface?: "paths" | "members";
  className?: string;
};

const COMPARE_ICONS: Record<MembershipCompareRow["icon"], LucideIcon> = {
  play: Play,
  timer: Timer,
  book: BookOpen,
  search: Search,
  rss: Rss,
  user: UserRound,
  lock: Lock,
  headphones: Headphones,
  layers: Layers,
  fileSearch: FileSearch,
  gauge: Gauge,
  message: MessageCircle,
  pen: PenLine,
  sparkles: Sparkles,
};

const HIGHLIGHT_ICONS = {
  shield: Shield,
  phone: Phone,
  library: Library,
  headphones: Headphones,
} as const;

function CellMark({ on }: { on: boolean }) {
  if (on) {
    return (
      <span className="inline-flex items-center gap-1 text-action">
        <Check className="size-4" aria-hidden />
        <span className="sr-only">כלול</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center text-muted">
      <Minus className="size-4" aria-hidden />
      <span className="sr-only">לא כלול</span>
    </span>
  );
}

/**
 * Membership plusses table + visible archive price frames.
 * Offers appear after club / archive access is open.
 */
export function MembershipBenefitsBoard({
  isMember = false,
  showOffers,
  showPricing = true,
  surface = "paths",
  className,
}: MembershipBenefitsBoardProps) {
  const title =
    surface === "members"
      ? "מה מקבלים כחברים."
      : "כל הפלוסים של החברות.";

  const lead =
    surface === "members"
      ? showPricing
        ? "טבלה ברורה: אורח, חשבון מייל, ומועדון. מתחתיה מסגרות מחיר גלויות. אין סליקה באתר. הגישה אחרי שיחת התאמה."
        : "טבלה ברורה: אורח, חשבון מייל, ומועדון. מחירים מופיעים בסעיף נפרד למטה. אין סליקה באתר. הגישה אחרי שיחת התאמה."
      : "רואים קודם מה כלול בכל שכבה. אחר כך בוחרים מסגרת מחיר. אין סליקה באתר. הגישה נפתחת ידנית אחרי התאמה.";

  const offersVisible = showOffers ?? isMember;
  /** On /members the hero already shows these four facts. */
  const showHighlights = surface !== "members";

  return (
    <section
      id="membership-benefits"
      aria-labelledby="membership-benefits-title"
      className={cn("scroll-mt-24 bg-background text-foreground", className)}
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="flex items-center gap-2 text-xs font-medium tracking-[0.16em] text-action uppercase">
          <Star className="size-3.5" fill="currentColor" aria-hidden />
          חברות
        </p>
        <h2
          id="membership-benefits-title"
          className="mt-3 max-w-3xl text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl"
        >
          {title}
        </h2>
        <p className="mt-4 max-w-prose text-sm leading-relaxed text-muted sm:text-base">
          {lead}
        </p>

        {showHighlights ? (
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {MEMBERSHIP_HIGHLIGHTS.map((item) => {
              const Icon = HIGHLIGHT_ICONS[item.icon];
              return (
                <li
                  key={item.id}
                  className="border border-foreground/15 bg-paper p-4"
                >
                  <p className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
                    <Icon className="size-4 shrink-0 text-action" aria-hidden />
                    {item.title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {item.body}
                  </p>
                </li>
              );
            })}
          </ul>
        ) : null}

        {offersVisible ? (
          <MemberOffersStrip isMember={isMember} className="mt-8" />
        ) : null}

        <div className="mt-10 overflow-x-auto overscroll-x-contain border border-foreground/20">
          <table className="w-full min-w-[44rem] border-collapse text-start text-sm">
            <caption className="sr-only">
              השוואת יתרונות: אורח, חשבון מייל, ומועדון
            </caption>
            <thead>
              <tr className="border-b border-foreground/20 bg-paper">
                <th scope="col" className="px-4 py-3 font-medium text-muted">
                  מה כלול
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-center font-medium text-muted"
                >
                  {ACCESS_LAYER_LABELS.guest}
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-center font-medium text-foreground/85"
                >
                  {ACCESS_LAYER_LABELS.account}
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-center font-medium text-action"
                >
                  {ACCESS_LAYER_LABELS.club}
                </th>
              </tr>
            </thead>
            <tbody>
              {MEMBERSHIP_COMPARE_ROWS.map((row) => {
                const Icon = COMPARE_ICONS[row.icon];
                return (
                  <tr
                    key={row.feature}
                    className="border-b border-foreground/10 align-top"
                  >
                    <th
                      scope="row"
                      className="px-4 py-3 font-medium text-foreground"
                    >
                      <span className="inline-flex items-start gap-2.5">
                        <Icon
                          className="mt-0.5 size-4 shrink-0 text-action"
                          aria-hidden
                        />
                        <span>
                          {row.feature}
                          {row.note ? (
                            <span className="mt-1 block text-xs font-normal text-muted">
                              {row.note}
                            </span>
                          ) : null}
                        </span>
                      </span>
                    </th>
                    <td className="px-3 py-3 text-center">
                      <CellMark on={row.guest} />
                    </td>
                    <td className="px-3 py-3 text-center">
                      <CellMark on={row.account} />
                    </td>
                    <td className="px-3 py-3 text-center">
                      <CellMark on={row.club} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!isMember ? (
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/profile?mode=register" className="btn btn-secondary">
              חשבון חינם
            </Link>
            <Link href="/members#access" className="btn btn-primary">
              בקשת גישה למועדון
            </Link>
            <Link href="/videos?filter=open" className="btn btn-secondary">
              להישאר בתוכן הפתוח
            </Link>
          </div>
        ) : null}

        {showPricing ? (
          <div id="membership-prices" className="mt-12 scroll-mt-28">
            <p className="flex items-center gap-2 text-xs font-medium tracking-[0.14em] text-action uppercase">
              <Library className="size-3.5" aria-hidden />
              מחירים
            </p>
            <h3 className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">
              מסגרות מחיר למאגר
            </h3>
            <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted">
              {isMember
                ? "אתם כבר בפנים. אפשר לחדש או לשדרג מסגרת. כל מסגרת כוללת מאגר מלא ופיד פודקאסט פרטי."
                : "כל מסגרת כוללת מאגר מלא ופיד פודקאסט פרטי. ממלאים פרטים ושולחים בקשה. הגישה ניתנת ידנית אחרי התאמה."}
            </p>

            <ul className="mt-8 space-y-3 md:hidden">
              {ARCHIVE_PRICING_ROWS.map((row) => {
                const highlighted = row.id === DEFAULT_ARCHIVE_PRICING_ID;
                return (
                  <li
                    key={row.id}
                    className={cn(
                      "border bg-background p-5",
                      highlighted ? "border-action" : "border-foreground/25",
                    )}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <h4 className="text-lg font-semibold tracking-tight">
                        {row.frame}
                        {highlighted ? (
                          <span className="ms-2 text-xs font-medium text-action">
                            מסלול יעד
                          </span>
                        ) : null}
                      </h4>
                      <p className="shrink-0 text-base font-semibold tabular-nums">
                        {row.price}
                      </p>
                    </div>
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
                      <Timer className="size-3.5 shrink-0" aria-hidden />
                      תוקף: {row.validity}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-foreground/80">
                      {row.analysis}
                    </p>
                    <div className="mt-5">
                      {isMember ? (
                        <Link
                          href="/videos?filter=club"
                          className="btn btn-secondary min-h-11 px-4 py-2 text-sm"
                        >
                          למאגר
                        </Link>
                      ) : (
                        <PathInquiryCta
                          label={`בקשת ${row.frame}`}
                          track={`הרשאת גישה למאגר הסרטונים, מסגרת ${row.frame}`}
                          priceBeforeVat={row.price}
                          detail={`תוקף: ${row.validity}. אין סליקה אוטומטית באתר.`}
                          requiresFitCall
                          showSms={false}
                          source={`benefits-${row.id}`}
                        />
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-8 hidden overflow-x-auto overscroll-x-contain border border-foreground/20 md:block">
              <table className="w-full min-w-[44rem] border-collapse text-start text-sm">
                <thead>
                  <tr className="border-b border-foreground/20 bg-paper text-muted">
                    <th className="px-4 py-3 font-medium">מסגרת</th>
                    <th className="px-4 py-3 font-medium">תוקף</th>
                    <th className="px-4 py-3 font-medium">
                      עלות (לפני מע&quot;מ)
                    </th>
                    <th className="px-4 py-3 font-medium">ניתוח</th>
                    <th className="px-4 py-3 font-medium">פעולה</th>
                  </tr>
                </thead>
                <tbody>
                  {ARCHIVE_PRICING_ROWS.map((row) => {
                    const highlighted = row.id === DEFAULT_ARCHIVE_PRICING_ID;
                    return (
                      <tr
                        key={row.id}
                        className={cn(
                          "border-b border-foreground/10 align-top",
                          highlighted && "bg-action/5",
                        )}
                      >
                        <td className="px-4 py-4 font-medium">
                          {row.frame}
                          {highlighted ? (
                            <span className="ms-2 text-xs text-action">
                              מסלול יעד
                            </span>
                          ) : null}
                        </td>
                        <td className="px-4 py-4 text-foreground/80">
                          {row.validity}
                        </td>
                        <td className="px-4 py-4 tabular-nums text-foreground/90">
                          {row.price}
                        </td>
                        <td className="px-4 py-4 text-muted">{row.analysis}</td>
                        <td className="px-4 py-4">
                          {isMember ? (
                            <Link
                              href="/videos?filter=club"
                              className="btn btn-secondary min-h-10 px-3 py-2 text-xs"
                            >
                              למאגר
                            </Link>
                          ) : (
                            <PathInquiryCta
                              label={`בקשת ${row.frame}`}
                              track={`הרשאת גישה למאגר הסרטונים, מסגרת ${row.frame}`}
                              priceBeforeVat={row.price}
                              detail={`תוקף: ${row.validity}. אין סליקה אוטומטית באתר.`}
                              requiresFitCall
                              showSms={false}
                              source={`benefits-${row.id}`}
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <ul className="mt-6 max-w-3xl space-y-1.5 text-xs leading-relaxed text-muted">
              <li>* {VAT_FOOTER_NOTE}</li>
              <li>* {REFUND_POLICY_NOTE}</li>
              <li>* {NO_AUTO_CHECKOUT_NOTE}</li>
              <li>* {RESPONSE_SLA_NOTE}</li>
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
