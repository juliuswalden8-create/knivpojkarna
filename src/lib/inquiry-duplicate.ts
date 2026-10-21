export function inquiryLockKey(email: string, businessName: string) {
  return `inquiry:${email.trim().toLowerCase()}|${businessName.trim().toLowerCase()}`;
}

export function decideInquiryWrite<T>(existing: T | null): "reuse" | "create" {
  return existing ? "reuse" : "create";
}

/** Serializes work that shares a key. Used to prove double-click behavior. Production uses a Postgres advisory lock. */
export function createKeyLock() {
  const tails = new Map<string, Promise<unknown>>();
  return function run<T>(key: string, task: () => Promise<T>): Promise<T> {
    const previous = tails.get(key) ?? Promise.resolve();
    const current = previous.then(task, task);
    tails.set(key, current.then(() => undefined, () => undefined));
    return current;
  };
}
