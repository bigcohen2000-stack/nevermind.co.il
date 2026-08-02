/** Club / voucher timing and discount constants (not a "use server" module). */

/** Default magic-link lifetime: 30 minutes. */
export const CLUB_MAGIC_TTL_MS = 30 * 60 * 1000;

/** Club-member registration discount (ILS, before VAT). */
export const CLUB_MEMBER_DISCOUNT_ILS = 100;

/** Days after club_members.created_at to claim the discount. */
export const CLUB_VOUCHER_VALIDITY_DAYS = 5;
