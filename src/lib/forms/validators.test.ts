import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
} from "@/lib/forms/validators";

describe("validateName", () => {
  it("rejects empty and short names", () => {
    assert.ok(validateName(""));
    assert.ok(validateName("א"));
    assert.equal(validateName("יקיר"), null);
  });
});

describe("validatePhone", () => {
  it("accepts Israeli mobile formats", () => {
    assert.equal(validatePhone("0501234567"), null);
    assert.equal(validatePhone("+972501234567"), null);
  });

  it("rejects incomplete numbers", () => {
    assert.ok(validatePhone("05012"));
    assert.ok(validatePhone(""));
  });
});

describe("validateEmail", () => {
  it("requires email when asked", () => {
    assert.ok(validateEmail("", { required: true }));
    assert.equal(validateEmail("", { required: false }), null);
    assert.equal(validateEmail("a@b.com"), null);
    assert.ok(validateEmail("not-an-email"));
  });
});

describe("validatePassword", () => {
  it("enforces minimum length", () => {
    assert.ok(validatePassword("ab"));
    assert.equal(validatePassword("abcd"), null);
  });
});
