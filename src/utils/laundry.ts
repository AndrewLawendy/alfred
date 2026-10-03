import type { OutfitUpdate } from "resources/useUpdateOutfits";
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

type Move<O extends Queued> = {
  outfits: O[];
  items: Map<string, Counted>;
  limits: Limits;
  date: string;
};

const holderOf = <O extends Queued>(outfits: O[]) =>
  outfits.find(({ heldTurn }) => heldTurn);

// The outfit Pick today's brings up: the one whose turn Not today held,
// otherwise the one after today's, blocked or not (Today asks about it)
export const upNext = <O extends Queued>(outfits: O[]) => {
  const current = outfits[activeIndex(outfits)];
  const holder = holderOf(outfits);
  return holder && holder !== current
    ? holder
    : outfits[(outfits.indexOf(current) + 1) % outfits.length];
};

// Pick today's: count the outfit on screen as worn and bring up the next one.
// One picked after browsing takes the slot of the outfit holding its turn, so
// everything it jumped keeps its turn. Positions are renumbered 0..n-1, as
// stored orders can have gaps or duplicates.
export const pick = <O extends Queued>({
  outfits,
  items,
  limits,
  date,
}: Move<O>): { outfits: OutfitUpdate[]; items: ItemUpdate[] } => {
  const current = outfits[activeIndex(outfits)];
  const holder = holderOf(outfits);
  const next = upNext(outfits);
  const queue =
    holder && holder !== current
      ? outfits
          .filter((outfit) => outfit !== current)
          .flatMap((outfit) =>
            outfit === holder ? [current, outfit] : [outfit]
          )
      : outfits;

  const outfitUpdates = queue
    .map((outfit, position): OutfitUpdate => ({
      id: outfit.id,
      changes: {
        ...(outfit.order !== position && { order: position }),
        ...(outfit === current && outfit !== next && { active: false }),
        // The jacket was for the day it was worn
        ...(outfit === current && outfit.jacket != null && { jacket: null }),
        ...(outfit === next && !outfit.active && { active: true }),
        ...(outfit === next && outfit.pickedOn !== date && { pickedOn: date }),
        ...(outfit.heldTurn && { heldTurn: false }),
      },
    }))
    .filter(({ changes }) => Object.keys(changes).length > 0);

  // Dated to the day it came on screen, however long it stayed there
  const wornOn = current.pickedOn ?? date;
  const itemUpdates = COUNTED.flatMap((slot): ItemUpdate[] => {
    const piece = items.get(current[slot]?.id ?? "");
    const limit = piece && limitOf(piece, limits);
    if (!piece || limit === undefined) return [];
    return [
      {
        id: piece.id,
        changes: {
          wears: Math.min(limit, wearsOf(piece) + 1),
          lastWornOn: wornOn,
        },
      },
    ];
  });

  return { outfits: outfitUpdates, items: itemUpdates };
};

// Not today: bring up the next wearable outfit, counting nothing; Wear today
// (`to`) brings up a chosen one, in the hamper or not. The first outfit
// skipped since the last pick holds its turn; coming back round to it lets go.
// Undefined when there's nowhere to go.
export const notToday = <O extends Queued>({
  outfits,
  items,
  limits,
  date,
  to,
}: Move<O> & { to?: string }): OutfitUpdate[] | undefined => {
  const current = outfits[activeIndex(outfits)];
  const next = to
    ? outfits.find(({ id }) => id === to)
    : wearableFrom(outfits, outfits.indexOf(current) + 1, items, limits);
  if (!next || next === current) return undefined;
  const holder = holderOf(outfits);
  return [
    {
      id: current.id,
      changes: {
        active: false,
        ...(current.jacket != null && { jacket: null }),
        ...(!holder && { heldTurn: true }),
      },
    },
    {
      id: next.id,
      changes: {
        active: true,
        ...(next.pickedOn !== date && { pickedOn: date }),
        ...(next === holder && { heldTurn: false }),
      },
    },
  ];
};

// The updates that put back what `updates` change; null where a field was missing
export const undoOf = <U extends { id: string; changes: object }>(
  docs: { id: string }[],
  updates: U[]
): U[] =>
  updates.map((update) => {
    const before = docs.find(({ id }) => id === update.id) as
      Record<string, unknown> | undefined;
    return {
      ...update,
      changes: Object.fromEntries(
        Object.keys(update.changes).map((key) => [key, before?.[key] ?? null])
      ),
    };
  });

// "Mon" within the last six days, otherwise "28 Sept"
export const sinceLabel = (date?: string | null, today = localDate()) => {
  if (!date) return "";
  const day = new Date(`${date}T00:00`);
  const days =
    (new Date(`${today}T00:00`).getTime() - day.getTime()) / 86400000;
  return day.toLocaleDateString(
    "en-GB",
    days < 7 ? { weekday: "short" } : { day: "numeric", month: "short" }
  );
};
