/**
 * Pickup & return delivery is always a single roundtrip fee.
 * Never charge pickup and return separately.
 * The free-delivery threshold is compared to the sharpening subtotal only.
 */

export const DELIVERY_ZONES = ["ZONE_1", "ZONE_2", "ZONE_3"] as const;
export type DeliveryZoneId = (typeof DELIVERY_ZONES)[number];
export type DeliveryZoneCode = DeliveryZoneId | "REVIEW" | "OUTSIDE";

export type DeliveryFeeSettings = {
  zone1Cents: number;
  zone2Cents: number;
  zone3Cents: number;
  freeThresholdCents: number;
};

export const DEFAULT_DELIVERY_FEES: DeliveryFeeSettings = {
  zone1Cents: 500,
  zone2Cents: 800,
  zone3Cents: 1200,
  freeThresholdCents: 4900,
};

export type DeliveryLocation = {
  areaName: string;
  inServiceArea: boolean;
  zone: DeliveryZoneCode;
  needsReview: boolean;
};

export type DeliveryQuote = {
  sharpeningSubtotalCents: number;
  /** Amount charged now. Null when the fee must be confirmed (review/outside). */
  deliveryFeeCents: number | null;
  /** Zone list price before the free-delivery waiver. Null when no zone was assigned. */
  listedDeliveryFeeCents: number | null;
  deliveryZone: DeliveryZoneCode;
  deliveryNeedsReview: boolean;
  deliveryFeeWaived: boolean;
  estimatedTotalCents: number;
  inServiceArea: boolean;
};

type AliasKind = "place" | "municipality" | "review" | "outside";

type Alias = {
  phrase: string;
  zone: DeliveryZoneCode;
  kind: AliasKind;
  label: string;
};

function alias(phrase: string, zone: DeliveryZoneCode, kind: AliasKind, label: string): Alias {
  return { phrase: fold(phrase), zone, kind, label };
}

/** Canonical towns shown in the booking dropdown, plus neighbourhoods along the corridor. */
const ALIASES: Alias[] = [
  // Zone 1 — Marbella, San Pedro, Puerto Banús, Nueva Andalucía
  alias("marbella", "ZONE_1", "municipality", "Marbella"),
  alias("marbella centro", "ZONE_1", "place", "Marbella"),
  alias("casco antiguo", "ZONE_1", "place", "Marbella"),
  alias("old town marbella", "ZONE_1", "place", "Marbella"),
  alias("marbella old town", "ZONE_1", "place", "Marbella"),
  alias("golden mile", "ZONE_1", "place", "Marbella"),
  alias("milla de oro", "ZONE_1", "place", "Marbella"),
  alias("puente romano", "ZONE_1", "place", "Marbella"),
  alias("marbella club", "ZONE_1", "place", "Marbella"),
  alias("nagüeles", "ZONE_1", "place", "Marbella"),
  alias("nagueles", "ZONE_1", "place", "Marbella"),
  alias("rio verde", "ZONE_1", "place", "Marbella"),
  alias("río verde", "ZONE_1", "place", "Marbella"),
  alias("la cañada", "ZONE_1", "place", "Marbella"),
  alias("la canada", "ZONE_1", "place", "Marbella"),
  alias("sierra blanca", "ZONE_1", "place", "Marbella"),
  alias("san pedro de alcántara", "ZONE_1", "place", "San Pedro de Alcántara"),
  alias("san pedro de alcantara", "ZONE_1", "place", "San Pedro de Alcántara"),
  alias("san pedro alcantara", "ZONE_1", "place", "San Pedro de Alcántara"),
  alias("san pedro", "ZONE_1", "place", "San Pedro de Alcántara"),
  alias("guadalmina", "ZONE_1", "place", "San Pedro de Alcántara"),
  alias("guadalmina alta", "ZONE_1", "place", "San Pedro de Alcántara"),
  alias("guadalmina baja", "ZONE_1", "place", "San Pedro de Alcántara"),
  alias("nueva alcántara", "ZONE_1", "place", "San Pedro de Alcántara"),
  alias("nueva alcantara", "ZONE_1", "place", "San Pedro de Alcántara"),
  alias("cortijo blanco", "ZONE_1", "place", "San Pedro de Alcántara"),
  alias("el angel", "ZONE_1", "place", "San Pedro de Alcántara"),
  alias("el ángel", "ZONE_1", "place", "San Pedro de Alcántara"),
  alias("puerto banús", "ZONE_1", "place", "Puerto Banús"),
  alias("puerto banus", "ZONE_1", "place", "Puerto Banús"),
  alias("banús", "ZONE_1", "place", "Puerto Banús"),
  alias("banus", "ZONE_1", "place", "Puerto Banús"),
  alias("playas del duque", "ZONE_1", "place", "Puerto Banús"),
  alias("marina banus", "ZONE_1", "place", "Puerto Banús"),
  alias("marina banús", "ZONE_1", "place", "Puerto Banús"),
  alias("nueva andalucía", "ZONE_1", "place", "Nueva Andalucía"),
  alias("nueva andalucia", "ZONE_1", "place", "Nueva Andalucía"),
  alias("aloha", "ZONE_1", "place", "Nueva Andalucía"),
  alias("las brisas", "ZONE_1", "place", "Nueva Andalucía"),
  alias("los naranjos", "ZONE_1", "place", "Nueva Andalucía"),
  alias("la cerquilla", "ZONE_1", "place", "Nueva Andalucía"),

  // Zone 2 — Elviria, Cabopino, Calahonda
  alias("elviria", "ZONE_2", "place", "Elviria"),
  alias("elviria hills", "ZONE_2", "place", "Elviria"),
  alias("la mairena", "ZONE_2", "place", "Elviria"),
  alias("santa maria elviria", "ZONE_2", "place", "Elviria"),
  alias("santa maría elviria", "ZONE_2", "place", "Elviria"),
  alias("el bosque elviria", "ZONE_2", "place", "Elviria"),
  alias("reserva de marbella", "ZONE_2", "place", "Elviria"),
  alias("don carlos", "ZONE_2", "place", "Elviria"),
  alias("cabopino", "ZONE_2", "place", "Cabopino"),
  alias("puerto cabopino", "ZONE_2", "place", "Cabopino"),
  alias("artola", "ZONE_2", "place", "Cabopino"),
  alias("artola dunas", "ZONE_2", "place", "Cabopino"),
  alias("calahonda", "ZONE_2", "place", "Calahonda"),
  alias("sitio de calahonda", "ZONE_2", "place", "Calahonda"),
  alias("calahonda pueblo", "ZONE_2", "place", "Calahonda"),

  // Zone 3 — Mijas Costa, Fuengirola
  alias("mijas costa", "ZONE_3", "municipality", "Mijas Costa"),
  alias("fuengirola", "ZONE_3", "municipality", "Fuengirola"),
  alias("fuengirola centro", "ZONE_3", "place", "Fuengirola"),
  alias("los boliches", "ZONE_3", "place", "Fuengirola"),
  alias("torreblanca", "ZONE_3", "place", "Fuengirola"),
  alias("carvajal", "ZONE_3", "place", "Fuengirola"),
  alias("los pacos", "ZONE_3", "place", "Fuengirola"),
  alias("pueblo lopez", "ZONE_3", "place", "Fuengirola"),
  alias("pueblo lópez", "ZONE_3", "place", "Fuengirola"),
  alias("la cala de mijas", "ZONE_3", "place", "Mijas Costa"),
  alias("la cala", "ZONE_3", "place", "Mijas Costa"),
  alias("el faro", "ZONE_3", "place", "Mijas Costa"),
  alias("miraflores", "ZONE_3", "place", "Mijas Costa"),
  alias("calanova", "ZONE_3", "place", "Mijas Costa"),

  // Boundary / too generic — never silently pick the cheapest zone
  alias("las chapas", "REVIEW", "review", "Las Chapas"),
  alias("hacienda las chapas", "REVIEW", "review", "Las Chapas"),
  alias("el rosario", "REVIEW", "review", "El Rosario"),
  alias("los monteros", "REVIEW", "review", "Los Monteros"),
  alias("riviera del sol", "REVIEW", "review", "Riviera del Sol"),
  alias("riviera", "REVIEW", "review", "Riviera del Sol"),
  alias("calypo fino", "REVIEW", "review", "Calypo Fino"),
  alias("calypo", "REVIEW", "review", "Calypo Fino"),
  alias("el chaparral", "REVIEW", "review", "El Chaparral"),
  alias("costa del sol", "REVIEW", "review", "Costa del Sol"),
  alias("mijas pueblo", "REVIEW", "review", "Mijas"),
  alias("mijas", "REVIEW", "review", "Mijas"),

  // Outside the Marbella–Fuengirola corridor
  alias("estepona", "OUTSIDE", "outside", "Estepona"),
  alias("cancelada", "OUTSIDE", "outside", "Estepona"),
  alias("costalita", "OUTSIDE", "outside", "Estepona"),
  alias("benahavis", "OUTSIDE", "outside", "Benahavís"),
  alias("benahavís", "OUTSIDE", "outside", "Benahavís"),
  alias("la zagaleta", "OUTSIDE", "outside", "Benahavís"),
  alias("benalmadena", "OUTSIDE", "outside", "Benalmádena"),
  alias("benalmádena", "OUTSIDE", "outside", "Benalmádena"),
  alias("arroyo de la miel", "OUTSIDE", "outside", "Benalmádena"),
  alias("torremolinos", "OUTSIDE", "outside", "Torremolinos"),
  alias("malaga", "OUTSIDE", "outside", "Málaga"),
  alias("málaga", "OUTSIDE", "outside", "Málaga"),
  alias("sotogrande", "OUTSIDE", "outside", "Sotogrande"),
  alias("manilva", "OUTSIDE", "outside", "Manilva"),
  alias("casares", "OUTSIDE", "outside", "Casares"),
];

const UNIQUE_POSTAL_ZONES: Record<string, { zone: DeliveryZoneId; label: string }> = {
  "29600": { zone: "ZONE_1", label: "Marbella" },
  "29601": { zone: "ZONE_1", label: "Marbella" },
  "29602": { zone: "ZONE_1", label: "Marbella" },
  "29603": { zone: "ZONE_1", label: "Marbella" },
  "29660": { zone: "ZONE_1", label: "Nueva Andalucía" },
  "29670": { zone: "ZONE_1", label: "San Pedro de Alcántara" },
  "29640": { zone: "ZONE_3", label: "Fuengirola" },
  "29641": { zone: "ZONE_3", label: "Fuengirola" },
};

const SHARED_IN_AREA_POSTALS = new Set(["29604", "29649"]);

const OUTSIDE_POSTALS = new Set(["29620", "29630", "29631", "29639", "29650", "29679", "29680", "29688", "29692"]);

const SORTED_ALIASES = [...ALIASES].sort((a, b) => b.phrase.length - a.phrase.length);

export function fold(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function containsPhrase(haystack: string, needle: string) {
  if (!needle) return false;
  return ` ${haystack} `.includes(` ${needle} `);
}

function digitsPostal(value?: string | null) {
  const digits = (value ?? "").replace(/\D/g, "");
  return digits.length >= 5 ? digits.slice(0, 5) : "";
}

export function feeForZone(zone: DeliveryZoneId, fees: DeliveryFeeSettings) {
  if (zone === "ZONE_1") return fees.zone1Cents;
  if (zone === "ZONE_2") return fees.zone2Cents;
  return fees.zone3Cents;
}

export function deliveryFeesFromSettings(settings: {
  deliveryZone1FeeCents: number;
  deliveryZone2FeeCents: number;
  deliveryZone3FeeCents: number;
  freeDeliveryThresholdCents: number;
}): DeliveryFeeSettings {
  return {
    zone1Cents: settings.deliveryZone1FeeCents,
    zone2Cents: settings.deliveryZone2FeeCents,
    zone3Cents: settings.deliveryZone3FeeCents,
    freeThresholdCents: settings.freeDeliveryThresholdCents,
  };
}

function matchesIn(text: string): Alias[] {
  const folded = fold(text);
  if (!folded) return [];
  const found: Alias[] = [];
  for (const item of SORTED_ALIASES) {
    if (!containsPhrase(folded, item.phrase)) continue;
    const overlapping = found.some(
      (existing) => containsPhrase(existing.phrase, item.phrase) || containsPhrase(item.phrase, existing.phrase),
    );
    if (overlapping) continue;
    found.push(item);
  }
  return found;
}

function uniqueZones(items: Alias[]): DeliveryZoneCode[] {
  return [...new Set(items.map((item) => item.zone))];
}

export function resolveDeliveryLocation(input: {
  areaName: string;
  areaDetail?: string | null;
  addressLine?: string | null;
  postalCode?: string | null;
}): DeliveryLocation {
  const areaName = (input.areaName ?? "").trim();
  const detail = (input.areaDetail ?? "").trim();
  const address = (input.addressLine ?? "").trim();
  const postal = digitsPostal(input.postalCode);

  if (!areaName || areaName === "__OUTSIDE__") {
    return {
      areaName: detail || "Outside launch area",
      inServiceArea: false,
      zone: "OUTSIDE",
      needsReview: false,
    };
  }

  const selected = areaName === "__IN_CORRIDOR__" ? "" : areaName;
  const displayFallback = detail || selected || "Marbella–Fuengirola (other)";
  const haystack = [selected, detail, address].filter(Boolean).join(" | ");
  const hits = matchesIn(haystack);

  const outside = hits.filter((hit) => hit.kind === "outside");
  const review = hits.filter((hit) => hit.kind === "review");
  const places = hits.filter((hit) => hit.kind === "place");
  const municipalities = hits.filter((hit) => hit.kind === "municipality");

  if (outside.length && !places.length && !municipalities.length && !review.length) {
    return {
      areaName: outside[0]?.label || displayFallback,
      inServiceArea: false,
      zone: "OUTSIDE",
      needsReview: false,
    };
  }

  if (outside.length && (places.length || municipalities.length || review.length)) {
    return { areaName: displayFallback, inServiceArea: true, zone: "REVIEW", needsReview: true };
  }

  if (review.length) {
    return {
      areaName: review[0]?.label || displayFallback,
      inServiceArea: true,
      zone: "REVIEW",
      needsReview: true,
    };
  }

  const primary = places.length ? places : municipalities;
  if (primary.length) {
    const zones = uniqueZones(primary).filter((zone): zone is DeliveryZoneId => zone === "ZONE_1" || zone === "ZONE_2" || zone === "ZONE_3");
    if (zones.length !== 1) {
      return { areaName: displayFallback, inServiceArea: true, zone: "REVIEW", needsReview: true };
    }
    const assigned = zones[0];
    if (postal && UNIQUE_POSTAL_ZONES[postal] && UNIQUE_POSTAL_ZONES[postal].zone !== assigned) {
      return { areaName: displayFallback, inServiceArea: true, zone: "REVIEW", needsReview: true };
    }
    if (postal && OUTSIDE_POSTALS.has(postal)) {
      return { areaName: displayFallback, inServiceArea: true, zone: "REVIEW", needsReview: true };
    }
    return {
      areaName: primary[0]?.label || displayFallback,
      inServiceArea: true,
      zone: assigned,
      needsReview: false,
    };
  }

  if (postal && OUTSIDE_POSTALS.has(postal)) {
    return { areaName: displayFallback, inServiceArea: false, zone: "OUTSIDE", needsReview: false };
  }
  if (postal && UNIQUE_POSTAL_ZONES[postal]) {
    const hit = UNIQUE_POSTAL_ZONES[postal];
    return { areaName: hit.label, inServiceArea: true, zone: hit.zone, needsReview: false };
  }
  if (postal && SHARED_IN_AREA_POSTALS.has(postal)) {
    return { areaName: displayFallback, inServiceArea: true, zone: "REVIEW", needsReview: true };
  }

  return { areaName: displayFallback, inServiceArea: true, zone: "REVIEW", needsReview: true };
}

export function calculateDeliveryQuote(
  sharpeningSubtotalCents: number,
  location: DeliveryLocation,
  fees: DeliveryFeeSettings = DEFAULT_DELIVERY_FEES,
): DeliveryQuote {
  const subtotal = Math.max(0, Math.round(sharpeningSubtotalCents));
  const waived = location.inServiceArea && subtotal >= fees.freeThresholdCents;

  if (!location.inServiceArea) {
    return {
      sharpeningSubtotalCents: subtotal,
      deliveryFeeCents: null,
      listedDeliveryFeeCents: null,
      deliveryZone: "OUTSIDE",
      deliveryNeedsReview: false,
      deliveryFeeWaived: false,
      estimatedTotalCents: subtotal,
      inServiceArea: false,
    };
  }

  if (location.needsReview || location.zone === "REVIEW" || location.zone === "OUTSIDE") {
    return {
      sharpeningSubtotalCents: subtotal,
      deliveryFeeCents: waived ? 0 : null,
      listedDeliveryFeeCents: null,
      deliveryZone: location.zone === "OUTSIDE" ? "OUTSIDE" : "REVIEW",
      deliveryNeedsReview: location.zone !== "OUTSIDE",
      deliveryFeeWaived: waived,
      estimatedTotalCents: subtotal,
      inServiceArea: true,
    };
  }

  const listed = feeForZone(location.zone, fees);
  const charged = waived ? 0 : listed;
  return {
    sharpeningSubtotalCents: subtotal,
    deliveryFeeCents: charged,
    listedDeliveryFeeCents: listed,
    deliveryZone: location.zone,
    deliveryNeedsReview: false,
    deliveryFeeWaived: waived,
    estimatedTotalCents: subtotal + charged,
    inServiceArea: true,
  };
}
