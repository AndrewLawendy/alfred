import { Outfit } from "utils/types";

// Outfits arrive sorted by `order`. The rotation follows their position in that
// list, never the stored `order` values, which can have gaps or duplicates.

type Update = {
  id: string;
  changes: Partial<Pick<Outfit, "order" | "active">>;
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
