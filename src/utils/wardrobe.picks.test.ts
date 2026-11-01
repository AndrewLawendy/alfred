import { gapsFor, togglePick } from "utils/wardrobe";

const types: Record<string, string> = {
  oxford: "top",
  polo: "top",
  jeans: "bottom",
  chinos: "bottom",
  dress: "dress",
  sneakers: "shoes",
  belt: "accessory",
  watch: "accessory",
  scarf: "accessory",
  blazer: "layer",
};
const typeOf = (id: string) => types[id];

test("a second top replaces the first; tapping it again takes it out", () => {
  expect(togglePick(["oxford", "jeans"], "polo", typeOf)).toEqual([
    "jeans",
    "polo",
  ]);
  expect(togglePick(["polo", "jeans"], "polo", typeOf)).toEqual(["jeans"]);
});

test("accessories add up instead of replacing each other", () => {
  expect(togglePick(["oxford", "belt"], "watch", typeOf)).toEqual([
    "oxford",
    "belt",
    "watch",
  ]);
});

test("a seventh piece is refused, but swapping within a category still works", () => {
  const six = ["oxford", "jeans", "blazer", "sneakers", "belt", "watch"];
  expect(togglePick(six, "scarf", typeOf)).toBe(six);
  expect(togglePick(six, "chinos", typeOf)).toEqual([
    "oxford",
    "blazer",
    "sneakers",
    "belt",
    "watch",
    "chinos",
  ]);
});

test("a top and a bottom are what's missing, unless there's a dress", () => {
  expect(gapsFor([])).toEqual(["top", "bottom"]);
  expect(gapsFor(["top", "shoes"])).toEqual(["bottom"]);
  expect(gapsFor(["dress"])).toEqual([]);
  expect(gapsFor(["top", "bottom"])).toEqual([]);
});
