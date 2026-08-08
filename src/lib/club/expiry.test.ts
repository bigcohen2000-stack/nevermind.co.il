import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  CLUB_RENEWAL_MONTHS,
  CLUB_RENEWAL_WITH_BONUS_MONTHS,
  planClubExtension,
  resolveClubExpiryState,
} from "@/lib/club/expiry";

describe("planClubExtension", () => {
  it("stacks on a future expiry", () => {
    const now = Date.parse("2026-08-08T12:00:00.000Z");
    const current = "2026-09-01T12:00:00.000Z";
    const plan = planClubExtension(current, CLUB_RENEWAL_MONTHS, now);
    assert.equal(plan.fromNow, false);
    assert.equal(plan.baseAt, current);
    assert.match(plan.nextExpiresAt, /^2026-10-01/);
  });

  it("starts from now when expired", () => {
    const now = Date.parse("2026-08-08T12:00:00.000Z");
    const plan = planClubExtension("2026-07-01T12:00:00.000Z", 3, now);
    assert.equal(plan.fromNow, true);
    assert.equal(plan.months, 3);
  });

  it("bonus renewal is three months", () => {
    assert.equal(CLUB_RENEWAL_WITH_BONUS_MONTHS, 3);
  });
});

describe("resolveClubExpiryState", () => {
  it("shows notice inside 14 days", () => {
    const now = Date.parse("2026-08-08T12:00:00.000Z");
    const state = resolveClubExpiryState("2026-08-15T12:00:00.000Z", now);
    assert.ok(state);
    assert.equal(state.showNotice, true);
    assert.equal(state.expired, false);
  });
});
