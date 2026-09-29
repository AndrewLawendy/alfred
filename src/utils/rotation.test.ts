import {
  afterDelete,
  nextOrder,
  nextOutfit,
  swapWithNext,
} from "utils/rotation";

const outfit = (id: string, order: number, active = false) => ({
  id,
  order,
  active,
});

test("next outfit follows list position, even with gaps in order", () => {
  const outfits = [outfit("a", 0), outfit("b", 2), outfit("c", 7)];
  expect(nextOutfit(outfits, outfits[0]).id).toBe("b");
  expect(nextOutfit(outfits, outfits[1]).id).toBe("c");
  expect(nextOutfit(outfits, outfits[2]).id).toBe("a");
});

test("new outfits go after the highest order", () => {
  expect(nextOrder([])).toBe(0);
  expect(nextOrder([outfit("a", 0), outfit("b", 4)])).toBe(5);
});

test("deleting today's outfit hands today to the next one and renumbers", () => {
  const outfits = [outfit("a", 0), outfit("b", 1, true), outfit("c", 2)];
  expect(afterDelete(outfits, "b")).toEqual([
    { id: "c", changes: { order: 1, active: true } },
  ]);
});

test("deleting the last outfit in the rotation wraps today to the first", () => {
  const outfits = [outfit("a", 0), outfit("b", 1), outfit("c", 2, true)];
  expect(afterDelete(outfits, "c")).toEqual([
    { id: "a", changes: { active: true } },
  ]);
});

test("deleting another outfit leaves today alone (no second 'today')", () => {
  const outfits = [outfit("a", 0), outfit("b", 1, true), outfit("c", 2)];
  expect(afterDelete(outfits, "a")).toEqual([
    { id: "b", changes: { order: 0 } },
    { id: "c", changes: { order: 1 } },
  ]);
});

test("deleting the only outfit changes nothing", () => {
  expect(afterDelete([outfit("a", 0, true)], "a")).toEqual([]);
});

test("swap wears the next outfit today and moves today's to right after it", () => {
  const outfits = [outfit("a", 0, true), outfit("b", 1), outfit("c", 2)];
  expect(swapWithNext(outfits, outfits[0])).toEqual([
    { id: "a", changes: { order: 1, active: false } },
    { id: "b", changes: { order: 0, active: true } },
  ]);
});

test("swap still swaps when two outfits share an order", () => {
  const outfits = [outfit("a", 0, true), outfit("b", 0), outfit("c", 1)];
  expect(swapWithNext(outfits, outfits[0])).toEqual([
    { id: "a", changes: { order: 1, active: false } },
    { id: "b", changes: { active: true } },
    { id: "c", changes: { order: 2 } },
  ]);
});

test("swapping the last outfit trades places with the first", () => {
  const outfits = [outfit("a", 0), outfit("b", 1), outfit("c", 2, true)];
  expect(swapWithNext(outfits, outfits[2])).toEqual([
    { id: "a", changes: { order: 2, active: true } },
    { id: "c", changes: { order: 0, active: false } },
  ]);
});
