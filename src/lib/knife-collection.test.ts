import assert from "node:assert/strict";
import { test } from "node:test";
import { collectionFields, collectionQuantityWarning } from "./knife-collection";

const empty = {
  knivesCollected: null,
  collectionNotes: null,
  collectedBy: null,
  collectedAt: null,
};

const firstRecorded = new Date("2026-11-02T09:00:00.000Z");
const later = new Date("2026-11-03T09:00:00.000Z");

test("an empty collection is not filled from the package quantity", () => {
  const saved = collectionFields({
    prelaunch: false,
    knivesCollected: "",
    collectionNotes: "",
    collectedBy: "",
    existing: empty,
    now: firstRecorded,
  });
  assert.equal(saved.ok, true);
  if (!saved.ok) return;
  assert.equal(saved.fields.knivesCollected, null);
  assert.equal(saved.fields.collectedAt, null);
});

test("the first recorded quantity sets the collection time", () => {
  const saved = collectionFields({
    prelaunch: false,
    knivesCollected: "4",
    collectionNotes: "One tip is chipped",
    collectedBy: "Julius Walden",
    existing: empty,
    now: firstRecorded,
  });
  assert.equal(saved.ok, true);
  if (!saved.ok) return;
  assert.equal(saved.fields.knivesCollected, 4);
  assert.equal(saved.fields.collectionNotes, "One tip is chipped");
  assert.equal(saved.fields.collectedBy, "Julius Walden");
  assert.equal(saved.fields.collectedAt, firstRecorded);
});

test("correcting the quantity keeps the original collection time", () => {
  const saved = collectionFields({
    prelaunch: false,
    knivesCollected: "5",
    collectionNotes: "Customer asked to leave the bread knife",
    collectedBy: "Oliver Landen",
    existing: {
      knivesCollected: 4,
      collectionNotes: "One tip is chipped",
      collectedBy: "Julius Walden",
      collectedAt: firstRecorded,
    },
    now: later,
  });
  assert.equal(saved.ok, true);
  if (!saved.ok) return;
  assert.equal(saved.fields.knivesCollected, 5);
  assert.equal(saved.fields.collectedBy, "Oliver Landen");
  assert.equal(saved.fields.collectedAt, firstRecorded);
});

test("a blank correction does not erase a recorded collection", () => {
  const saved = collectionFields({
    prelaunch: false,
    knivesCollected: "",
    collectionNotes: "",
    collectedBy: "",
    existing: {
      knivesCollected: 4,
      collectionNotes: null,
      collectedBy: "Julius Walden",
      collectedAt: firstRecorded,
    },
    now: later,
  });
  assert.equal(saved.ok, true);
  if (!saved.ok) return;
  assert.equal(saved.fields.knivesCollected, 4);
  assert.equal(saved.fields.collectedAt, firstRecorded);
});

test("zero is a real count and does not copy the package", () => {
  const saved = collectionFields({
    prelaunch: false,
    knivesCollected: "0",
    collectionNotes: "",
    collectedBy: "Oliver Landen",
    existing: empty,
    now: firstRecorded,
  });
  assert.equal(saved.ok, true);
  if (!saved.ok) return;
  assert.equal(saved.fields.knivesCollected, 0);
  assert.equal(saved.fields.collectedAt, firstRecorded);
});

test("rejects fractions, negatives, and counts above the limit", () => {
  for (const knivesCollected of ["1.5", "-1", "101", "ten", "4e1"]) {
    const saved = collectionFields({
      prelaunch: false,
      knivesCollected,
      collectionNotes: "",
      collectedBy: "Julius Walden",
      existing: empty,
      now: firstRecorded,
    });
    assert.equal(saved.ok, false, knivesCollected);
  }
});

test("rejects an unknown collector and notes that are too long", () => {
  const unknown = collectionFields({
    prelaunch: false,
    knivesCollected: "2",
    collectionNotes: "",
    collectedBy: "Someone else",
    existing: empty,
    now: firstRecorded,
  });
  assert.equal(unknown.ok, false);

  for (const collectedBy of ["Julius", "Partner"]) {
    const shortName = collectionFields({
      prelaunch: false,
      knivesCollected: "2",
      collectionNotes: "",
      collectedBy,
      existing: empty,
      now: firstRecorded,
    });
    assert.equal(shortName.ok, false, collectedBy);
  }

  const longNotes = collectionFields({
    prelaunch: false,
    knivesCollected: "2",
    collectionNotes: "x".repeat(501),
    collectedBy: "Julius Walden",
    existing: empty,
    now: firstRecorded,
  });
  assert.equal(longNotes.ok, false);
});

test("prelaunch does not record or erase a collection", () => {
  const ignored = collectionFields({
    prelaunch: true,
    knivesCollected: "8",
    collectionNotes: "Damaged",
    collectedBy: "Julius Walden",
    existing: empty,
    now: firstRecorded,
  });
  assert.deepEqual(ignored, { ok: true, fields: empty });

  const existing = {
    knivesCollected: 3,
    collectionNotes: "Serrated",
    collectedBy: "Oliver Landen",
    collectedAt: firstRecorded,
  };
  const preserved = collectionFields({
    prelaunch: true,
    knivesCollected: "",
    collectionNotes: "",
    collectedBy: "",
    existing,
    now: later,
  });
  assert.deepEqual(preserved, { ok: true, fields: existing });
});

test("a different collected quantity warns without implying a price change", () => {
  assert.equal(collectionQuantityWarning(10, null), null);
  assert.equal(collectionQuantityWarning(10, 10), null);
  assert.match(collectionQuantityWarning(10, 8) ?? "", /price has not been changed/);
});
