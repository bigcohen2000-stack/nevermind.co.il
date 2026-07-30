import type { Metadata } from "next";

import { ContactLeadForm } from "@/components/contact/contact-lead-form";
import { Eyebrow, Watermark } from "@/components/ui/editorial";
import { CONTACT_FAQ, PROCESS_STEPS } from "@/lib/content/offers";

export const metadata: Metadata = {
  title: "יצירת קשר",
  description:
    "מלא פרטים ואחזור אליך בוואטסאפ. שיחת היכרות קצרה, בלי התחייבות.",
};

export default function ContactPage() {
  return (
    <main className="w-full text-start">
      <section aria-labelledby="contact-hero-title" className="band-dark">
        <Watermark className="bottom-[-1.5rem] start-[-0.5rem] text-[6rem] text-background/[0.045] sm:text-[9rem] lg:text-[12rem]">
          קשר
        </Watermark>
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-24 lg:py-32">
          <Eyebrow onDark>בוא נתחיל</Eyebrow>
          <h1
            id="contact-hero-title"
            className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
          >
            מלא פרטים.
            <br />
            ממשיכים בוואטסאפ.
          </h1>
          <p className="mt-7 max-w-prose text-lg leading-relaxed text-background/80">
            בלי אותיות קטנות. בלי למכור חלומות. פשוט שיחה קצרה לבדוק אם זה
            מתאים.
          </p>
        </div>
      </section>

      <section
        aria-labelledby="contact-form-title"
        className="bg-background text-foreground"
      >
        <div className="mx-auto grid w-full max-w-6xl gap-14 px-6 py-20 lg:grid-cols-12 lg:py-28">
          <div className="lg:col-span-6">
            <Eyebrow>פרטים</Eyebrow>
            <h2
              id="contact-form-title"
              className="mt-3 text-2xl font-semibold tracking-tight lg:text-3xl"
            >
              בוא נבדוק יחד.
            </h2>
            <p className="mt-4 max-w-prose leading-relaxed text-foreground/80">
              אחרי השליחה נפתח וואטסאפ עם ההודעה מוכנה. חזרה בדרך כלל תוך 24
              שעות.
            </p>
            <div className="mt-10">
              <ContactLeadForm />
            </div>
          </div>

          <div className="lg:col-span-5 lg:col-start-8">
            <Eyebrow>מה קורה אחרי</Eyebrow>
            <ol className="mt-6 space-y-6">
              {PROCESS_STEPS.map((step) => (
                <li key={step.index} className="border-s border-foreground/15 ps-5">
                  <p className="text-sm text-muted">{step.index}</p>
                  <h3 className="mt-1 text-lg font-semibold tracking-tight">
                    {step.title}
                  </h3>
                  <p className="mt-2 leading-relaxed text-foreground/75">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section aria-labelledby="contact-faq-title" className="band-paper">
        <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
          <Eyebrow>שאלות נפוצות</Eyebrow>
          <h2
            id="contact-faq-title"
            className="mt-3 text-2xl font-semibold tracking-tight lg:text-3xl"
          >
            מה ששואלים לפני שמתחילים.
          </h2>
          <ul className="mt-12 space-y-0 divide-y divide-foreground/10">
            {CONTACT_FAQ.map((item) => (
              <li key={item.question} className="py-6">
                <h3 className="text-lg font-semibold tracking-tight">
                  {item.question}
                </h3>
                <p className="mt-3 max-w-3xl leading-relaxed text-foreground/80">
                  {item.answer}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
