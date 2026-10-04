import {
  DEFAULT_LIMITS,
  byId,
  hamperGroups,
  isInHamper,
  pick,
} from "utils/laundry";
import type { Queued } from "utils/laundry";

// Laundry over the flexible model: categories, per-piece limits, any pieces

const MON = "2026-09-28";
const TUE = "2026-09-29";
const limits = DEFAULT_LIMITS;

const item = (
  id: string,
  type: string,
  wears?: number,
  lastWornOn?: string,
  wearLimit?: number
) => ({
  id,
  type,
  wears,
  lastWornOn,
  ...(wearLimit !== undefined && { wearLimit }),
});

test("per-piece limits override the category, and 0 means not counted", () => {
  expect(isInHamper(item("t", "top", 1, undefined, 0), limits)).toBe(false);
  expect(isInHamper(item("h", "accessory", 3, undefined, 3), limits)).toBe(
    true
  );
  expect(isInHamper(item("h", "accessory", 9), limits)).toBe(false);
  expect(isInHamper(item("c", "outerwear", 9, undefined, 1), limits)).toBe(
    false
  );
});

test("a counted dress and a layer count like tops and bottoms", () => {
  expect(isInHamper(item("d", "dress", 1), limits)).toBe(true);
  expect(isInHamper(item("l", "layer", 4), limits)).toBe(false);
  expect(isInHamper(item("l", "layer", 5), limits)).toBe(true);
});

test("old item types still count: a shirt as a top", () => {
  expect(isInHamper(item("s", "shirt", 1), limits)).toBe(true);
  expect(isInHamper(item("p", "pants", 2), limits)).toBe(false);
});

test("a pick counts every counted piece of the outfit, once each", () => {
  const items = byId([
    item("d", "dress"),
    item("f", "shoes"),
    item("s", "accessory", 0, undefined, 2),
    item("b", "accessory"),
  ]);
  const outfits: Queued[] = [
    {
      id: "a",
      order: 0,
      active: true,
      pickedOn: MON,
      pieces: [{ id: "d" }, { id: "f" }, { id: "s" }, { id: "b" }, { id: "d" }],
    },
    { id: "z", order: 1, pieces: [{ id: "x" }, { id: "y" }] },
  ];
  expect(
    pick({ outfits, items, limits, date: TUE }).items.map(({ id }) => id)
  ).toEqual(["d", "s"]);
});

test("old-shape outfits still count through their slots", () => {
  const items = byId([item("sa", "top"), item("p", "bottom")]);
  const old: Queued[] = [
    {
      id: "a",
      order: 0,
      active: true,
      pickedOn: MON,
      shirt: { id: "sa" },
      pants: { id: "p" },
    },
    { id: "b", order: 1, shirt: { id: "x" }, pants: { id: "y" } },
  ];
  expect(
    pick({ outfits: old, items, limits, date: TUE }).items.map(({ id }) => id)
  ).toEqual(["sa", "p"]);
});

test("the hamper groups by category in layout order", () => {
  const groups = hamperGroups([
    item("pants", "bottom", 3, "2026-09-27"),
    item("dress", "dress", 1, "2026-09-28"),
    item("scarf", "accessory", 2, "2026-09-29", 2),
    item("shirt", "top", 1, "2026-09-30"),
  ]);
  expect(groups.map(({ type }) => type)).toEqual([
    "top",
    "dress",
    "bottom",
    "accessory",
  ]);
});

test("a photo-only outfit is never counted or skipped", () => {
  const items = byId([item("t", "top", 1)]);
  const outfits: Queued[] = [
    { id: "a", order: 0, active: true, pieces: [], photoUrl: "https://p" },
    { id: "b", order: 1, pieces: [], photoUrl: "https://q" },
  ];
  const result = pick({ outfits, items, limits, date: TUE });
  expect(result.items).toEqual([]);
  expect(result.outfits.find(({ id }) => id === "b")?.changes.active).toBe(
    true
  );
});
