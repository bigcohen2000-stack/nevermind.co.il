import type { Metadata } from "next";
import Link from "next/link";
import {
  Mail,
  MessageCircle,
  Phone,
  Shield,
} from "lucide-react";

import { ContactLeadForm } from "@/components/contact/contact-lead-form";
import { DirectWhatsAppQuestionBox } from "@/components/contact/direct-whatsapp-question-box";
import { JsonLd } from "@/components/seo/json-ld";
import { ProductFaq } from "@/components/seo/product-faq";
import { Eyebrow, Watermark } from "@/components/ui/editorial";
import { CONTACT_FAQ, RESPONSE_SLA_NOTE } from "@/lib/content/offers";
import { shareImageMetadata } from "@/lib/og/share-image";
import { buildBreadcrumbList } from "@/lib/seo/breadcrumb-json-ld";

export const metadata: Metadata = {
  title: "יצירת קשר",
  description:
    "יצירת קשר עם NeverMind: וואטסאפ, SMS או מייל. שיחת התאמה קצרה. מענה תוך 24 שעות עסקים. אין סליקה באתר.",
  alternates: {
    canonical: "https://nevermind.co.il/contact",
  },
  ...shareImageMetadata("יצירת קשר. וואטסאפ או מייל."),
};

type PageProps = {
  searchParams: Promise<{ from?: string }>;
};

const CONTACT_HIGHLIGHTS = [
  {
    id: "whatsapp",
    icon: MessageCircle,
    title: "וואטסאפ",
    body: "המסלול המהיר. הודעה מוכנה עם הפרטים.",
  },
  {
    id: "sms",
    icon: Phone,
    title: "SMS רגיל",
    body: "מתאים גם לטלפון כשר. אותה הודעה.",
  },
  {
    id: "email",
    icon: Mail,
    title: "מייל",
    body: "גיבוי. שולחים מהטופס. חוזרים בהקדם.",
  },
  {
    id: "fit",
    icon: Shield,
    title: "בלי סליקה",
    body: "שיחת התאמה קצרה. אין תשלום אוטומטי באתר.",
  },
] as const;

const CONTACT_STEPS = [
  {
    n: "01",
    title: "שולחים פנייה",
    body: "וואטסאפ, SMS או מייל. שם וטלפון מספיקים להתחלה.",
  },
  {
    n: "02",
    title: "בודקים התאמה",
    body: "שיחה קצרה של כ-10 דקות. לא ייעוץ. רק כיוון.",
  },
  {
    n: "03",
    title: "ממשיכים או לא",
    body: "מסלול ייעוץ, מאגר, או עצירה. בלי לחץ.",
  },
] as const;

export default async function ContactPage({ searchParams }: PageProps) {
  const { from } = await searchParams;
  const source = from?.trim() || undefined;

  const breadcrumbLd = buildBreadcrumbList([
    { name: "בית", path: "/" },
    { name: "יצירת קשר", path: "/contact" },
  ]);

  return (
    <main className="w-full text-start">
      <JsonLd data={breadcrumbLd} />

      <section aria-labelledby="contact-hero-title" className="band-dark">
        <Watermark className="bottom-[-1.5rem] start-[-0.5rem] text-[6rem] text-foreground/[0.045] sm:text-[9rem] lg:text-[12rem]">
          קשר
        </Watermark>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
          <Eyebrow onDark>יצירת קשר</Eyebrow>
          <h1
            id="contact-hero-title"
            className="mt-5 max-w-3xl text-fluid-display font-semibold leading-[1.05] tracking-tight"
          >
            שאלה ספציפית.
            <br />
            תשובה ישירה.
          </h1>
          <p className="mt-6 max-w-prose text-base leading-relaxed text-foreground/80 sm:text-lg">
            וואטסאפ, SMS או מייל. שיחת התאמה קצרה אם צריך. אין סליקה באתר.
          </p>
          <p className="mt-3 max-w-prose text-sm text-foreground/60">
            {RESPONSE_SLA_NOTE}
          </p>

          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {CONTACT_HIGHLIGHTS.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.id}
                  className="border border-[#FAFAF8]/15 bg-black/25 p-4"
                >
                  <p className="flex items-center gap-2 text-sm font-semibold tracking-tight text-[#FAFAF8]">
                    <Icon className="size-4 shrink-0 text-action" aria-hidden />
                    {item.title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[#FAFAF8]/70">
                    {item.body}
                  </p>
                </li>
              );
            })}
          </ul>

          <div className="mt-10 flex flex-wrap gap-3">
            <a href="#contact-form" className="btn btn-primary">
              לטופס פנייה
            </a>
            <a href="#contact-whatsapp" className="btn btn-secondary">
              שאלה בוואטסאפ
            </a>
            <Link href="/paths" className="btn btn-secondary">
              למסלולים
            </Link>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="contact-form-title"
        className="bg-background text-foreground"
      >
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <p className="flex items-center gap-2 text-xs font-medium tracking-[0.16em] text-action uppercase">
              <MessageCircle className="size-3.5" aria-hidden />
              פנייה
            </p>
            <h2
              id="contact-form-title"
              className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              ממלאים ובוחרים ערוץ.
            </h2>
            <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted sm:text-base">
              שם וטלפון חובה. אימייל רק אם שולחים במייל. ההודעה נפתחת מוכנה
              בוואטסאפ או ב-SMS.
            </p>

            <div id="contact-form" className="mt-8 scroll-mt-28">
              <ContactLeadForm source={source} />
            </div>

            <div
              id="contact-whatsapp"
              className="mt-12 scroll-mt-28 border-t border-foreground/10 pt-10"
            >
              <h3 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
                <MessageCircle className="size-5 text-action" aria-hidden />
                שאלה קצרה בוואטסאפ
              </h3>
              <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">
                בלי טופס. כותבים ושולחים. נפתח וואטסאפ עם ההודעה מוכנה.
              </p>
              <div className="mt-5">
                <DirectWhatsAppQuestionBox />
              </div>
            </div>
          </div>

          <aside className="lg:col-span-5">
            <div className="border border-foreground/15 bg-paper p-5 sm:p-6">
              <p className="text-xs font-medium tracking-[0.14em] text-action uppercase">
                מה קורה אחר כך
              </p>
              <ol className="mt-5 space-y-5">
                {CONTACT_STEPS.map((step) => (
                  <li key={step.n}>
                    <p className="text-xs tabular-nums text-muted">{step.n}</p>
                    <h3 className="mt-1 text-base font-semibold tracking-tight">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">
                      {step.body}
                    </p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-4 border border-foreground/15 bg-background p-5">
              <p className="text-sm font-semibold tracking-tight">קישורים שימושיים</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <Link href="/members#membership-prices" className="link-arrow">
                    מסגרות מחיר למאגר
                  </Link>
                </li>
                <li>
                  <Link href="/members" className="link-arrow">
                    כניסה למועדון
                  </Link>
                </li>
                <li>
                  <Link href="/booking" className="link-arrow">
                    מפרק מחשבות לפני פגישה
                  </Link>
                </li>
                <li>
                  <Link href="/mechanisms" className="link-arrow">
                    מפת מנגנונים
                  </Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <ProductFaq
        items={CONTACT_FAQ}
        title="שאלות לפני שמתחילים."
        headingId="contact-faq-title"
        sectionId="contact-faq"
      />
    </main>
  );
}
