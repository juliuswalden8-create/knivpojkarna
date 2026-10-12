import assert from "node:assert/strict";
import { test } from "node:test";
import { bookingWhere, parseInquiryFilters } from "./admin-query";

test("parseInquiryFilters trims empty values", () => {
  assert.deepEqual(parseInquiryFilters({ q: "  ada  ", status: "", from: "2026-10-01" }), {
    q: "ada",
    status: undefined,
    from: "2026-10-01",
    to: undefined,
    sort: undefined,
  });
});

test("bookingWhere searches name email phone and date range", () => {
  const where = bookingWhere({ q: "ada", status: "NEW", from: "2026-10-01", to: "2026-10-02" }) as {
    AND: Array<Record<string, unknown>>;
  };
  assert.equal(where.AND.length, 3);
  assert.deepEqual(where.AND[0], { status: "NEW" });
  const createdAt = where.AND[1].createdAt as { gte: Date; lte: Date };
  assert.equal(createdAt.gte.toISOString().startsWith("2026-10-01"), true);
  assert.equal(createdAt.lte.toISOString().startsWith("2026-10-02"), true);
  const search = where.AND[2].OR as Array<Record<string, unknown>>;
  assert.equal(search.length, 7);
});
