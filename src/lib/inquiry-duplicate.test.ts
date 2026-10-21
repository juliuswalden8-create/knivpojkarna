import assert from "node:assert/strict";
import { test } from "node:test";
import { createKeyLock, decideInquiryWrite, inquiryLockKey } from "./inquiry-duplicate";

test("the same business inquiry shares one lock key", () => {
  assert.equal(inquiryLockKey(" Ada@Cafe.test ", " Sol "), inquiryLockKey("ada@cafe.test", "sol"));
  assert.notEqual(inquiryLockKey("ada@cafe.test", "Sol"), inquiryLockKey("ada@cafe.test", "Luna"));
});

test("a repeated inquiry is reused and a new one is created", () => {
  assert.equal(decideInquiryWrite({ reference: "BQ-1" }), "reuse");
  assert.equal(decideInquiryWrite(null), "create");
});

test("concurrent submissions of the same inquiry create one row", async () => {
  const run = createKeyLock();
  const rows: { key: string; reference: string }[] = [];
  const submit = (key: string, reference: string) =>
    run(key, async () => {
      const existing = rows.find((row) => row.key === key) ?? null;
      if (decideInquiryWrite(existing) === "reuse") return { created: false, reference: existing!.reference };
      rows.push({ key, reference });
      return { created: true, reference };
    });
  const key = inquiryLockKey("ada@cafe.test", "Sol");
  const [first, second] = await Promise.all([submit(key, "BQ-1"), submit(key, "BQ-2")]);
  assert.equal(rows.length, 1);
  assert.equal(first.reference, "BQ-1");
  assert.equal(second.reference, "BQ-1");
  assert.equal(first.created !== second.created, true);
});

test("different inquiries are not treated as duplicates", async () => {
  const run = createKeyLock();
  const rows: string[] = [];
  const submit = (key: string) =>
    run(key, async () => {
      const existing = rows.find((row) => row === key) ?? null;
      if (decideInquiryWrite(existing) === "reuse") return false;
      rows.push(key);
      return true;
    });
  const created = await Promise.all([
    submit(inquiryLockKey("a@cafe.test", "Sol")),
    submit(inquiryLockKey("b@cafe.test", "Luna")),
  ]);
  assert.deepEqual(created, [true, true]);
  assert.equal(rows.length, 2);
});
