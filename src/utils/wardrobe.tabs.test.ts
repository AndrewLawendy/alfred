import { tabFor } from "utils/wardrobe";

test("old wardrobe links open the matching category", () => {
  expect(tabFor("shirt")).toBe("top");
  expect(tabFor("jacket")).toBe("outerwear");
  expect(tabFor("dress")).toBe("dress");
  expect(tabFor(undefined)).toBe("top");
  expect(tabFor("nope")).toBe("top");
});
