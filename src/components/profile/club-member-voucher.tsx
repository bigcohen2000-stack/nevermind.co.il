import Link from "next/link";

import {
  CLUB_MEMBER_DISCOUNT_ILS,
  CLUB_VOUCHER_VALIDITY_DAYS,
} from "@/lib/club/constants";
import {
  ARCHIVE_PRICING_ROWS,
  discountedArchiveAmount,
  formatIlsPrice,
} from "@/lib/content/offers";
import type { ClubVoucherState } from "@/lib/profile/club-voucher";

type ClubMemberVoucherProps = {
  voucher: ClubVoucherState;
};

/**
 * Club-only registration discount strip. Prices follow ARCHIVE_PRICING_ROWS.
 */
export function ClubMemberVoucher({ voucher }: ClubMemberVoucherProps) {
  const expiresLabel = new Date(voucher.expiresAt).toLocaleDateString("he-IL", {
    dateStyle: "medium",
  });

  return (
    <section
      aria-labelledby="club-voucher-title"
      className="mt-10 border border-[#FAFAF8]/10 bg-[#0A0A0B] p-6 sm:p-8"
    >
      <h2
        id="club-voucher-title"
        className="text-xl font-semibold tracking-tight"
      >
        שובר חבר מועדון
      </h2>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-[#9CA3AF]">
        הנחה של {CLUB_MEMBER_DISCOUNT_ILS} ש&quot;ח על מסלולי המאגר. תקף{" "}
        {CLUB_VOUCHER_VALIDITY_DAYS} ימים מהצטרפות למועדון. להשלמת הרשמה עד{" "}
        {expiresLabel}.
      </p>

      {voucher.expired ? (
        <p className="mt-6 text-sm text-[#9CA3AF]">
          פג תוקף השובר. המחירים למטה הם מחיר מלא מהמחירון.
        </p>
      ) : (
        <p className="mt-4 text-sm text-[#FAFAF8]">
          נותרו {voucher.daysLeft} ימים להירשם עם ההנחה.
        </p>
      )}

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[28rem] border-collapse text-start text-sm">
          <thead>
            <tr className="border-b border-[#FAFAF8]/15 text-[#9CA3AF]">
              <th className="py-2 pe-3 font-medium">מסגרת</th>
              <th className="py-2 pe-3 font-medium">תוקף</th>
              <th className="py-2 pe-3 font-medium">מחיר מלא</th>
              <th className="py-2 font-medium">
                {voucher.expired ? "אחרי תוקף" : "אחרי הנחה"}
              </th>
            </tr>
          </thead>
          <tbody>
            {ARCHIVE_PRICING_ROWS.map((row) => {
              const discounted = voucher.expired
                ? row.amountIls
                : discountedArchiveAmount(
                    row.amountIls,
                    CLUB_MEMBER_DISCOUNT_ILS,
                  );
              return (
                <tr
                  key={row.id}
                  className="border-b border-[#FAFAF8]/10 text-[#FAFAF8]"
                >
                  <td className="py-2.5 pe-3">{row.frame}</td>
                  <td className="py-2.5 pe-3 text-[#9CA3AF]">{row.validity}</td>
                  <td className="py-2.5 pe-3 tabular-nums text-[#9CA3AF]">
                    {formatIlsPrice(row.amountIls)}
                  </td>
                  <td className="py-2.5 tabular-nums font-medium">
                    {formatIlsPrice(discounted)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-[#9CA3AF]">
        מחירים לפני מע&quot;מ. מתעדכנים אוטומטית מהמחירון באתר.
      </p>

      <p className="mt-6">
        <Link
          href="/contact"
          className="border border-[#FAFAF8]/25 px-4 py-2 text-sm text-[#FAFAF8] transition hover:border-[#D42B2B] hover:text-[#D42B2B]"
        >
          להשלמת הרשמה
        </Link>
      </p>
    </section>
  );
}
