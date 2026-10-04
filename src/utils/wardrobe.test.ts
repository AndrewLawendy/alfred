import {
  CATEGORIES,
  OUTFIT_CATEGORIES,
  categoryOf,
  isOutfitValid,
  normalizeItem,
  normalizeOutfit,
  pieceIdsOf,
} from "utils/wardrobe";

const ref = (id: string) => ({ id });

test("old item types map to categories; new ones stay", () => {
  expect(categoryOf("shirt")).toBe("top");
  expect(categoryOf("pants")).toBe("bottom");
  expect(categoryOf("belt")).toBe("accessory");
  expect(categoryOf("shoes")).toBe("shoes");
  expect(categoryOf("jacket")).toBe("outerwear");
  expect(categoryOf("dress")).toBe("dress");
  expect(categoryOf("something else")).toBe("accessory");
  expect(normalizeItem({ id: "a", type: "shirt", title: "Oxford" })).toEqual({
    id: "a",
    type: "top",
    title: "Oxford",
  });
});

test("outerwear isn't an outfit category", () => {
  expect(OUTFIT_CATEGORIES).toEqual([
    "top",
    "dress",
    "bottom",
    "layer",
    "shoes",
    "accessory",
  ]);
  expect(CATEGORIES.find(({ key }) => key === "accessory")?.multi).toBe(true);
});

test("an old outfit's slots become pieces: shirt, pants, belt, shoes", () => {
  const old = {
    id: "o",
    shirt: ref("s"),
    belt: ref("b"),
    pants: ref("p"),
    shoes: ref("f"),
  };
  expect(pieceIdsOf(old)).toEqual(["s", "p", "b", "f"]);
  expect(normalizeOutfit(old).pieces.map(({ id }) => id)).toEqual([
    "s",
    "p",
    "b",
    "f",
  ]);
});

test("a new outfit keeps its pieces and ignores leftover old fields", () => {
  const mixed = { id: "o", pieces: [ref("d"), ref("f")], shirt: ref("s") };
  expect(pieceIdsOf(mixed)).toEqual(["d", "f"]);
});

test("missing slots are dropped", () => {
  expect(pieceIdsOf({ shirt: ref("s"), pants: undefined })).toEqual(["s"]);
});

test("an outfit has 2 to 6 pieces", () => {
  expect(isOutfitValid(1)).toBe(false);
  expect(isOutfitValid(2)).toBe(true);
  expect(isOutfitValid(6)).toBe(true);
  expect(isOutfitValid(7)).toBe(false);
});
