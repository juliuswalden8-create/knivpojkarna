/** Log failures without writing customer fields to stdout. */
export function logError(scope: string, err: unknown) {
  const name = err instanceof Error ? err.name : "Error";
  console.error(`[${scope}] ${name}`);
}
