import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { resolveSiteAccessTier } from "@/lib/access/site-tier";
import { getTierCtaBundle } from "@/lib/access/tier-cta";

describe("resolveSiteAccessTier", () => {
  it("returns guest when anonymous", () => {
    assert.equal(
      resolveSiteAccessTier({ authUserId: null, entitled: false }),
      "guest",
    );
  });

  it("returns account when email session exists without entitlement", () => {
    assert.equal(
      resolveSiteAccessTier({
        authUserId: "user-1",
        entitled: false,
      }),
      "account",
    );
  });

  it("returns club when entitled even without auth user", () => {
    assert.equal(
      resolveSiteAccessTier({ authUserId: null, entitled: true }),
      "club",
    );
  });

  it("prefers club over account when both apply", () => {
    assert.equal(
      resolveSiteAccessTier({
        authUserId: "user-1",
        entitled: true,
      }),
      "club",
    );
  });
});

describe("getTierCtaBundle", () => {
  it("points guests to club and free account", () => {
    const bundle = getTierCtaBundle("guest");
    assert.equal(bundle.primary.href, "/members#access");
    assert.equal(bundle.secondary?.href, "/profile?mode=register");
  });

  it("points account users to club request", () => {
    const bundle = getTierCtaBundle("account");
    assert.equal(bundle.primary.href, "/members#access");
    assert.match(bundle.note, /לא פותח/);
  });

  it("points club users to archive", () => {
    const bundle = getTierCtaBundle("club");
    assert.equal(bundle.primary.href, "/videos?filter=club");
  });
});
