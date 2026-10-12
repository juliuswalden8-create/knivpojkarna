import { LAUNCH_AREA_NAMES } from "./launch-areas";

export const AREA_OTHER_IN_CORRIDOR = "__IN_CORRIDOR__";
export const AREA_OUTSIDE = "__OUTSIDE__";

export type ServiceAreaChoice = {
  areaName: string;
  inServiceArea: boolean;
};

export function isListedLaunchTown(name: string) {
  const needle = name.trim().toLowerCase();
  return LAUNCH_AREA_NAMES.some((town) => town.toLowerCase() === needle);
}

/**
 * Towns on the launch list, or another neighborhood in the Marbella–Fuengirola
 * corridor, count as inside the service area. Explicit "outside" does not.
 * Unknown free-text is treated as in-corridor so we do not reject valid local addresses.
 */
export function resolveServiceArea(areaName: string, areaDetail?: string | null): ServiceAreaChoice {
  const name = areaName.trim();
  const detail = areaDetail?.trim() || "";

  if (!name || name === AREA_OUTSIDE) {
    return { areaName: detail || "Outside launch area", inServiceArea: false };
  }
  if (name === AREA_OTHER_IN_CORRIDOR) {
    return { areaName: detail || "Marbella–Fuengirola (other)", inServiceArea: true };
  }
  if (isListedLaunchTown(name)) {
    return { areaName: name, inServiceArea: true };
  }
  return { areaName: name, inServiceArea: true };
}

export function duplicateWindowMs() {
  return 2 * 60 * 1000;
}

export function isWithinDuplicateWindow(createdAt: Date, now = new Date(), windowMs = duplicateWindowMs()) {
  return now.getTime() - createdAt.getTime() < windowMs;
}
