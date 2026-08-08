type ClubOpsMember = {
  phone: string;
  display_name: string;
  expires_at: string | null;
  ops_link_minted_at: string | null;
  ops_whatsapp_sent_at: string | null;
};

type ClubOpsChecklistProps = {
  members: ClubOpsMember[];
};

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  const t = Date.parse(expiresAt);
  return Number.isFinite(t) && t < Date.now();
}

/**
 * Live ops board from club_members (Supabase), not localStorage.
 * Shows who still needs link mint / WhatsApp mark.
 */
export function ClubOpsChecklist({ members }: ClubOpsChecklistProps) {
  const active = members.filter((m) => !isExpired(m.expires_at));
  const needLink = active.filter((m) => !m.ops_link_minted_at);
  const needWhatsapp = active.filter(
    (m) => m.ops_link_minted_at && !m.ops_whatsapp_sent_at,
  );
  const complete = active.filter(
    (m) => m.ops_link_minted_at && m.ops_whatsapp_sent_at,
  );

  return (
    <section
      className="border border-zinc-700 bg-zinc-900/50 p-5 sm:p-6"
      aria-labelledby="club-ops-checklist-title"
    >
      <h2
        id="club-ops-checklist-title"
        className="text-base font-semibold text-zinc-100"
      >
        לוח תפעול מועדון
      </h2>
      <p className="mt-2 text-sm text-zinc-400">
        נשמר ב-Supabase. אחרי הנפקת קישור מסומן אוטומטית. אחרי וואטסאפ לוחצים
        &quot;וואטסאפ&quot; בשורת החבר.
      </p>

      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-4">
        <div className="border border-zinc-700 bg-zinc-950/40 p-3">
          <dt className="text-xs text-zinc-500">פעילים</dt>
          <dd className="mt-1 text-lg font-semibold text-zinc-100">
            {active.length}
          </dd>
        </div>
        <div className="border border-zinc-700 bg-zinc-950/40 p-3">
          <dt className="text-xs text-zinc-500">חסר קישור</dt>
          <dd className="mt-1 text-lg font-semibold text-amber-200">
            {needLink.length}
          </dd>
        </div>
        <div className="border border-zinc-700 bg-zinc-950/40 p-3">
          <dt className="text-xs text-zinc-500">ממתין לוואטסאפ</dt>
          <dd className="mt-1 text-lg font-semibold text-amber-200">
            {needWhatsapp.length}
          </dd>
        </div>
        <div className="border border-zinc-700 bg-zinc-950/40 p-3">
          <dt className="text-xs text-zinc-500">הושלם</dt>
          <dd className="mt-1 text-lg font-semibold text-emerald-200">
            {complete.length}
          </dd>
        </div>
      </dl>

      {needLink.length > 0 || needWhatsapp.length > 0 ? (
        <ul className="mt-5 space-y-2 text-sm">
          {needLink.slice(0, 8).map((m) => (
            <li
              key={`link-${m.phone}`}
              className="border border-amber-900/50 bg-amber-950/20 px-3 py-2 text-amber-100"
            >
              <span className="font-medium">{m.display_name || m.phone}</span>
              <span className="ms-2 text-xs text-amber-200/80">
                חסר קישור או סימון הנפקה
              </span>
            </li>
          ))}
          {needWhatsapp.slice(0, 8).map((m) => (
            <li
              key={`wa-${m.phone}`}
              className="border border-amber-900/50 bg-amber-950/20 px-3 py-2 text-amber-100"
            >
              <span className="font-medium">{m.display_name || m.phone}</span>
              <span className="ms-2 text-xs text-amber-200/80">
                לסמן וואטסאפ אחרי שליחה
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-5 text-sm text-zinc-400">
          אין תורים פתוחים ברשימה הנוכחית.
        </p>
      )}

      <ol className="mt-6 space-y-2 text-xs leading-relaxed text-zinc-500">
        <li>1. פתיחת גישה + תוקף בשורת החבר.</li>
        <li>2. הנפקת קישור (מסומן אוטומטית) או סיסמה משותפת.</li>
        <li>3. העתקת תבנית וואטסאפ.</li>
        <li>4. סימון &quot;וואטסאפ&quot; בשורה אחרי שנשלח.</li>
      </ol>
    </section>
  );
}
