import { render, screen, within } from "@testing-library/react";

import OutfitLayout from "components/OutfitLayout";
import { Item } from "utils/types";

const piece = (id: string, type: Item["type"]) =>
  ({ id, type, title: id, description: "", imageUrl: "" }) as Item;

const titlesIn = (name: string) =>
  within(screen.getByRole("group", { name }))
    .queryAllByRole("button")
    .map((button) => button.getAttribute("aria-label"));

test("tops, dresses and bottoms make the column; the layer, shoes and accessories go in the rail", () => {
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
  expect(titlesIn("Main pieces")).toEqual(["Blouse", "Trousers"]);
  expect(titlesIn("Side pieces")).toEqual(["Blazer", "Loafers", "Hijab"]);
});

test("an outfit of only shoes and accessories fills the column", () => {
  render(
    <OutfitLayout
      pieces={[piece("Loafers", "shoes"), piece("Watch", "accessory")]}
    />
  );
  expect(titlesIn("Main pieces")).toEqual(["Loafers", "Watch"]);
  expect(screen.queryByRole("group", { name: "Side pieces" })).toBeNull();
});

test("a top and bottom alone stand side by side; with a rail they stack", () => {
  const { unmount } = render(
    <OutfitLayout pieces={[piece("Polo", "top"), piece("Jeans", "bottom")]} />
  );
  expect(
    screen.getByRole("group", { name: "Main pieces" }).dataset.arrangement
  ).toBe("row");
  unmount();
  render(
    <OutfitLayout
      pieces={[
        piece("Polo", "top"),
        piece("Jeans", "bottom"),
        piece("Sneakers", "shoes"),
      ]}
    />
  );
  expect(
    screen.getByRole("group", { name: "Main pieces" }).dataset.arrangement
  ).toBe("column");
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
