/**
 * The environment password may create the first admin account only.
 * Once setup has completed, deleting that account must not recreate it.
 */
export function shouldBootstrapAdmin(adminCount: number, bootstrapCompleted: boolean) {
  return adminCount === 0 && bootstrapCompleted === false;
}
