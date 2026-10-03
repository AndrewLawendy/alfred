import { afterDelete, nextOrder } from "utils/rotation";

const outfit = (id: string, order: number, active = false) => ({
  id,
  order,
  active,
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
