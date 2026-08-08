import assert from "node:assert/strict";
import { describe, it } from "node:test";

function readBearer(req: Request): string | null {
  const header = req.headers.get("authorization");
  if (header?.startsWith("Bearer ")) return header.slice(7).trim();
  return req.headers.get("x-cron-secret")?.trim() || null;
}

function isAuthorized(req: Request, secret: string | undefined): boolean {
  const token = readBearer(req);
  return Boolean(secret && token && token === secret);
}

describe("admin sync auth", () => {
  it("accepts Bearer CRON_SECRET", () => {
    const req = new Request("https://nevermind.co.il/api/admin/sync", {
      headers: { authorization: "Bearer test-secret-123" },
    });
    assert.equal(isAuthorized(req, "test-secret-123"), true);
  });

  it("accepts x-cron-secret header", () => {
    const req = new Request("https://nevermind.co.il/api/admin/sync", {
      headers: { "x-cron-secret": "test-secret-123" },
    });
    assert.equal(isAuthorized(req, "test-secret-123"), true);
  });

  it("rejects missing or wrong secret", () => {
    const req = new Request("https://nevermind.co.il/api/admin/sync");
    assert.equal(isAuthorized(req, "test-secret-123"), false);
    assert.equal(
      isAuthorized(
        new Request("https://nevermind.co.il/api/admin/sync", {
          headers: { authorization: "Bearer wrong" },
        }),
        "test-secret-123",
      ),
      false,
    );
  });
});
