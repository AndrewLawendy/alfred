import { render, screen, within } from "@testing-library/react";

import OutfitLayout from "components/OutfitLayout";
import { Item } from "utils/types";

const piece = (id: string, type: Item["type"]) =>
  ({ id, type, title: id, description: "", imageUrl: "" }) as Item;

const titlesIn = (name: string) =>
  within(screen.getByRole("group", { name }))
    .queryAllByRole("button")
    .map((button) => button.getAttribute("aria-label"));

test("tops, dresses, bottoms and layers share the tall row; shoes and accessories go in the strip", () => {
  render(
    <OutfitLayout
      pieces={[
        piece("Loafers", "shoes"),
        piece("Blazer", "layer"),
        piece("Blouse", "top"),
        piece("Hijab", "accessory"),
        piece("Trousers", "bottom"),
      ]}
    />
  );
  expect(titlesIn("Main pieces")).toEqual(["Blouse", "Trousers", "Blazer"]);
  expect(titlesIn("Small pieces")).toEqual(["Loafers", "Hijab"]);
});

test("an outfit of only small pieces fills the tall row", () => {
  render(
    <OutfitLayout
      pieces={[piece("Loafers", "shoes"), piece("Watch", "accessory")]}
    />
  );
  expect(titlesIn("Main pieces")).toEqual(["Loafers", "Watch"]);
  expect(screen.queryByRole("group", { name: "Small pieces" })).toBeNull();
});

test("a deleted piece leaves a gap that leads to picking another", () => {
  const onMissing = vi.fn();
  render(
    <OutfitLayout
      pieces={[piece("Dress", "dress")]}
      missing={1}
      onMissing={onMissing}
    />
  );
  screen.getByRole("button", { name: "Pick a piece" }).click();
  expect(onMissing).toHaveBeenCalled();
});
