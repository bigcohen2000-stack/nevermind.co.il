import { STUDIO_GUIDE_SECTIONS } from "@/lib/studio/guide";

export function StudioGuidePanel() {
  return (
    <section aria-labelledby="studio-guide-heading" className="space-y-6">
      <h2 id="studio-guide-heading" className="sr-only">
        מדריך אזורי הסטודיו
      </h2>
      <ul className="space-y-4">
        {STUDIO_GUIDE_SECTIONS.map((section) => (
          <li
            key={section.id}
            id={section.id}
            className="border border-zinc-800 bg-zinc-950/40 p-4 sm:p-5"
          >
            <h3 className="text-base font-semibold text-zinc-50">
              {section.title}
            </h3>
            <dl className="mt-3 space-y-2 text-sm leading-relaxed text-zinc-400">
              <div>
                <dt className="text-xs font-medium text-zinc-500">מה זה</dt>
                <dd className="mt-0.5 text-zinc-300">{section.what}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-zinc-500">
                  מה אפשר לעשות
                </dt>
                <dd className="mt-0.5 text-zinc-300">{section.canDo}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-zinc-500">איפה</dt>
                <dd className="mt-0.5 font-mono text-xs text-zinc-300">
                  {section.where}
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </section>
  );
}
