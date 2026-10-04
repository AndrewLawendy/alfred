import {
  cleanName,
  isOutfitValid,
  NAME_MAX,
  outfitFields,
  outfitTitle,
} from "utils/wardrobe";

test("a photo alone is an outfit; without one, 2 to 6 pieces", () => {
  expect(isOutfitValid(0, true)).toBe(true);
  expect(isOutfitValid(1, true)).toBe(true);
  expect(isOutfitValid(1, false)).toBe(false);
  expect(isOutfitValid(0)).toBe(false);
  expect(isOutfitValid(7, true)).toBe(false);
});

test("names are trimmed, capped, and blank means none", () => {
  expect(cleanName("  Office   Monday ")).toBe("Office Monday");
  expect(cleanName("   ")).toBeUndefined();
  expect(cleanName("x".repeat(60))).toHaveLength(NAME_MAX);
});

test("an outfit is called by its name, else by its number", () => {
  expect(outfitTitle({ name: "Navy work dress" }, 4)).toBe("Navy work dress");
  expect(outfitTitle({}, 4)).toBe("No. 4");
});

test("saving removes a cleared photo or name instead of writing blanks", () => {
  expect(outfitFields({ picks: ["a", "b"], name: " " })).toEqual({
    pieces: ["a", "b"],
    remove: ["photoUrl", "name"],
  });
  expect(
    outfitFields({ picks: [], photoUrl: "https://p", name: "Gym" })
  ).toEqual({ pieces: [], photoUrl: "https://p", name: "Gym", remove: [] });
});
