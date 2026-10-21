/** Stored value and dropdown label are the same full name. */
export const COLLECTORS = ["Julius Walden", "Oliver Landen"] as const;
export type Collector = (typeof COLLECTORS)[number];

/** Household collections stay well below a business estimate. */
export const MAX_KNIVES_COLLECTED = 100;
export const COLLECTION_NOTES_MAX = 500;

export type CollectionRecord = {
  knivesCollected: number | null;
  collectionNotes: string | null;
  collectedBy: string | null;
  collectedAt: Date | null;
};

export type CollectionInput = {
  prelaunch: boolean;
  knivesCollected: string;
  collectionNotes: string;
  collectedBy: string;
  existing: CollectionRecord;
  now: Date;
};

export type CollectionResult = { ok: true; fields: CollectionRecord } | { ok: false };

function isCollector(value: string): value is Collector {
  return (COLLECTORS as readonly string[]).includes(value);
}

/**
 * Records how many knives were physically collected.
 * An empty value stays empty and is never filled from the package.
 * The first saved quantity sets collectedAt. Later edits keep that time.
 * PRELAUNCH ignores the submitted fields and leaves the stored record unchanged.
 */
export function collectionFields(input: CollectionInput): CollectionResult {
  if (input.prelaunch) {
    return { ok: true, fields: input.existing };
  }

  const rawCount = input.knivesCollected.trim();
  let knivesCollected: number | null;
  if (!rawCount) {
    knivesCollected = input.existing.collectedAt ? input.existing.knivesCollected : null;
  } else if (!/^\d+$/.test(rawCount)) {
    return { ok: false };
  } else {
    const count = Number(rawCount);
    if (!Number.isInteger(count) || count < 0 || count > MAX_KNIVES_COLLECTED) return { ok: false };
    knivesCollected = count;
  }

  const notes = input.collectionNotes.trim();
  if (notes.length > COLLECTION_NOTES_MAX) return { ok: false };

  const collector = input.collectedBy.trim();
  if (collector && !isCollector(collector)) return { ok: false };

  const collectedAt =
    knivesCollected !== null && input.existing.collectedAt === null ? input.now : input.existing.collectedAt;

  return {
    ok: true,
    fields: {
      knivesCollected,
      collectionNotes: notes || null,
      collectedBy: collector || null,
      collectedAt,
    },
  };
}

/** Warning only. The booking price is left unchanged. */
export function collectionQuantityWarning(packageKnives: number, collected: number | null) {
  if (collected == null || collected === packageKnives) return null;
  return "Collected quantity differs from the package. The price has not been changed.";
}
