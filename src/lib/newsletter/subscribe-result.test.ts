import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  resolveSubscribeOutcome,
  subscribeOutcomeIsSuccess,
} from "@/lib/newsletter/subscribe-result";

describe("resolveSubscribeOutcome", () => {
  it("returns inserted on fresh save", () => {
    assert.deepEqual(
      resolveSubscribeOutcome({
        inserted: true,
        duplicate: false,
        wasUnsubscribed: false,
        dbError: null,
      }),
      { kind: "inserted" },
    );
  });

  it("returns already_active on duplicate active row", () => {
    assert.deepEqual(
      resolveSubscribeOutcome({
        inserted: false,
        duplicate: true,
        wasUnsubscribed: false,
        dbError: null,
      }),
      { kind: "already_active" },
    );
  });

  it("returns reactivated after unsubscribe", () => {
    assert.deepEqual(
      resolveSubscribeOutcome({
        inserted: false,
        duplicate: true,
        wasUnsubscribed: true,
        dbError: null,
      }),
      { kind: "reactivated" },
    );
  });

  it("returns failed when db error persists", () => {
    const outcome = resolveSubscribeOutcome({
      inserted: false,
      duplicate: false,
      wasUnsubscribed: false,
      dbError: "connection refused",
    });
    assert.equal(outcome.kind, "failed");
    assert.equal(subscribeOutcomeIsSuccess(outcome), false);
  });
});

describe("subscribeOutcomeIsSuccess", () => {
  it("accepts inserted, already_active, and reactivated", () => {
    assert.equal(subscribeOutcomeIsSuccess({ kind: "inserted" }), true);
    assert.equal(subscribeOutcomeIsSuccess({ kind: "already_active" }), true);
    assert.equal(subscribeOutcomeIsSuccess({ kind: "reactivated" }), true);
  });
});
