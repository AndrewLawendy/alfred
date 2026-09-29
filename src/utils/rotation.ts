import { Outfit } from "utils/types";

// Outfits arrive sorted by `order`. The rotation follows their position in that
// list, never the stored `order` values, which can have gaps or duplicates.

type Update = {
  id: string;
  changes: Partial<Pick<Outfit, "order" | "active">>;
};

export const nextOutfit = <T extends Pick<Outfit, "id">>(
  outfits: T[],
  current: T
) => {
  const index = outfits.findIndex(({ id }) => id === current.id);
  return outfits[(index + 1) % outfits.length];
};

// Where a new outfit goes: after the last one
export const nextOrder = (outfits: Pick<Outfit, "order">[]) =>
  outfits.reduce((max, { order }) => Math.max(max, order + 1), 0);

// What to write after deleting an outfit: renumber the rest 0..n-1 and, if the
// deleted one was today's, hand "today" to the outfit that came after it
export const afterDelete = (
  outfits: Pick<Outfit, "id" | "order" | "active">[],
  deletedId: string
): Update[] => {
  const index = outfits.findIndex(({ id }) => id === deletedId);
  if (index === -1) return [];

  const remaining = outfits.filter(({ id }) => id !== deletedId);
  const newTodayId =
    outfits[index].active && remaining.length
      ? remaining[index % remaining.length].id
      : undefined;

  return remaining
    .map(({ id, order, active }, position) => ({
      id,
      changes: {
        ...(order !== position && { order: position }),
        ...(id === newTodayId && !active && { active: true }),
      },
    }))
    .filter(({ changes }) => Object.keys(changes).length > 0);
};

// What to write to wear the next outfit today and put today's right after it.
// Trades list positions and renumbers everything 0..n-1, since swapping the
// stored `order` values does nothing when two of them are equal.
export const swapWithNext = (
  outfits: Pick<Outfit, "id" | "order" | "active">[],
  current: Pick<Outfit, "id">
): Update[] => {
  const index = outfits.findIndex(({ id }) => id === current.id);
  if (index === -1 || outfits.length < 2) return [];
  const nextIndex = (index + 1) % outfits.length;
  const positionOf = (position: number) =>
    position === index ? nextIndex : position === nextIndex ? index : position;

  return outfits
    .map(({ id, order, active }, position) => ({
      id,
      changes: {
        ...(order !== positionOf(position) && { order: positionOf(position) }),
        ...(position === index && active && { active: false }),
        ...(position === nextIndex && !active && { active: true }),
      },
    }))
    .filter(({ changes }) => Object.keys(changes).length > 0);
};
