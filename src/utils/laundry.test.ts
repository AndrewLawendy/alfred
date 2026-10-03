import {
  DEFAULT_LIMITS,
  activeIndex,
  byId,
  cleanCount,
  hamperPieces,
  inHamper,
  isInHamper,
  localDate,
  toHamper,
  washed,
  wearableFrom,
} from "utils/laundry";
import type { Queued } from "utils/laundry";

const item = (
  id: string,
  type: "shirt" | "pants" | "belt" | "shoes" | "jacket",
  wears?: number,
  lastWornOn?: string
) => ({ id, type, wears, lastWornOn });

const outfit = (
  id: string,
  order: number,
  shirt: string,
  pants: string,
  extra: Partial<Queued> = {}
): Queued => ({
  id,
  order,
  active: false,
  shirt: { id: shirt },
  pants: { id: pants },
  ...extra,
});

const limits = DEFAULT_LIMITS;

test("local dates are YYYY-MM-DD", () => {
  expect(localDate(new Date(2026, 9, 3, 23, 59))).toBe("2026-10-03");
});

test("an item is in the hamper once its wears reach its type's limit", () => {
  expect(isInHamper(item("s", "shirt", 1), limits)).toBe(true);
  expect(isInHamper(item("s", "shirt", 0), limits)).toBe(false);
  expect(isInHamper(item("s", "shirt"), limits)).toBe(false);
  expect(isInHamper(item("p", "pants", 2), limits)).toBe(false);
  expect(isInHamper(item("p", "pants", 3), limits)).toBe(true);
});

test("belts, shoes and jackets never go in the hamper", () => {
  expect(isInHamper(item("b", "belt", 99), limits)).toBe(false);
  expect(isInHamper(item("j", "jacket", 99), limits)).toBe(false);
});

test("lowering a limit puts items in the hamper immediately, raising takes them out", () => {
  const chinos = item("p", "pants", 2);
  expect(isInHamper(chinos, { ...limits, pants: 2 })).toBe(true);
  expect(isInHamper(item("p", "pants", 3), { ...limits, pants: 4 })).toBe(
    false
  );
});

test("hamper pieces skip slots whose item is missing", () => {
  const items = byId([item("s1", "shirt", 1)]);
  expect(hamperPieces(outfit("a", 0, "s1", "gone"), items, limits)).toEqual([
    items.get("s1"),
  ]);
  expect(hamperPieces(outfit("b", 1, "gone", "gone"), items, limits)).toEqual(
    []
  );
});

test("wearable outfits are found from a position, going round once", () => {
  const items = byId([
    item("s1", "shirt", 1),
    item("s2", "shirt"),
    item("p", "pants"),
  ]);
  const outfits = [
    outfit("a", 0, "s1", "p"),
    outfit("b", 1, "s2", "p"),
    outfit("c", 2, "s1", "p"),
  ];
  expect(wearableFrom(outfits, 0, items, limits)?.id).toBe("b");
  expect(wearableFrom(outfits, 2, items, limits)?.id).toBe("b");
  expect(cleanCount(outfits, items, limits)).toBe(1);
});

test("no wearable outfit gives undefined; the outfit on screen is the active one", () => {
  const items = byId([item("s1", "shirt", 1), item("p", "pants", 3)]);
  const outfits = [
    outfit("a", 0, "s1", "p"),
    outfit("b", 1, "s1", "p2", { active: true }),
  ];
  expect(wearableFrom(outfits, 0, items, limits)).toBeUndefined();
  expect(activeIndex(outfits)).toBe(1);
  expect(activeIndex([outfit("x", 0, "s", "p")])).toBe(0);
});

test("the hamper lists items oldest first; washing and hamper set wears", () => {
  const items = [
    item("new", "shirt", 1, "2026-10-02"),
    item("old", "pants", 3, "2026-09-28"),
    item("clean", "shirt", 0),
  ];
  expect(inHamper(items, limits).map(({ id }) => id)).toEqual(["old", "new"]);
  expect(washed(items[0])).toEqual({ id: "new", changes: { wears: 0 } });
  expect(toHamper(item("p", "pants", 1), limits, "2026-10-03")).toEqual({
    id: "p",
    changes: { wears: 3, lastWornOn: "2026-10-03" },
  });
});
