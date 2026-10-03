import { Item, Outfit } from "utils/types";

// Laundry rules: how many wears each type takes before washing, what's in the
// hamper, and which outfits can be worn. Pure, so Home, the Hamper and tests
// share them. functions/reminder.js repeats isInHamper, cleanCount and upNext.

export type Limits = { shirt: number; pants: number };
export const DEFAULT_LIMITS: Limits = { shirt: 1, pants: 3 };
// The counted outfit slots, which are also the counted item types
export const COUNTED = ["shirt", "pants"] as const;

export type Counted = {
  id: string;
  type: Item["type"];
  wears?: number | null;
  lastWornOn?: string | null;
};
export type Queued = Pick<Outfit, "id" | "order"> & {
  active?: boolean;
  shirt?: { id: string };
  pants?: { id: string };
  jacket?: unknown;
  pickedOn?: string | null;
  heldTurn?: boolean | null;
};
export type ItemUpdate = {
  id: string;
  changes: { wears?: number | null; lastWornOn?: string | null };
};

// Local "YYYY-MM-DD"; en-CA formats dates that way
export const localDate = (date = new Date()) =>
  date.toLocaleDateString("en-CA");

export const limitOf = (item: Counted, limits: Limits) =>
  item.type === "shirt" || item.type === "pants"
    ? limits[item.type]
    : undefined;

const wearsOf = (item: Counted) => item.wears ?? 0;

export const isInHamper = (item: Counted, limits: Limits) => {
  const limit = limitOf(item, limits);
  return limit !== undefined && wearsOf(item) >= limit;
};

export const byId = <I extends Counted>(items: I[]) =>
  new Map(items.map((item) => [item.id, item]));

// The outfit's counted pieces that are in the hamper; a deleted piece is skipped
export const hamperPieces = <I extends Counted>(
  outfit: Queued,
  items: Map<string, I>,
  limits: Limits
) =>
  COUNTED.map((slot) => items.get(outfit[slot]?.id ?? "")).filter(
    (piece): piece is I => !!piece && isInHamper(piece, limits)
  );

export const isWearable = (
  outfit: Queued,
  items: Map<string, Counted>,
  limits: Limits
) => hamperPieces(outfit, items, limits).length === 0;

export const cleanCount = (
  outfits: Queued[],
  items: Map<string, Counted>,
  limits: Limits
) => outfits.filter((outfit) => isWearable(outfit, items, limits)).length;

// The outfit up next; the first one when none is marked
export const activeIndex = (outfits: Queued[]) =>
  Math.max(
    0,
    outfits.findIndex(({ active }) => active)
  );

// The first wearable outfit from position `start`, going round the rotation once
export const wearableFrom = <O extends Queued>(
  outfits: O[],
  start: number,
  items: Map<string, Counted>,
  limits: Limits
): O | undefined => {
  for (let step = 0; step < outfits.length; step++) {
    const outfit = outfits[(start + step) % outfits.length];
    if (isWearable(outfit, items, limits)) return outfit;
  }
  return undefined;
};

// What's in the hamper, waiting longest first
export const inHamper = <I extends Counted>(items: I[], limits: Limits) =>
  items
    .filter((item) => isInHamper(item, limits))
    .sort((a, b) => (a.lastWornOn ?? "").localeCompare(b.lastWornOn ?? ""));

export const washed = (item: Counted): ItemUpdate => ({
  id: item.id,
  changes: { wears: 0 },
});

// "Put in hamper": full wears, whatever it had
export const toHamper = (
  item: Counted,
  limits: Limits,
  date: string
): ItemUpdate => ({
  id: item.id,
  changes: { wears: limitOf(item, limits) ?? 0, lastWornOn: date },
});
