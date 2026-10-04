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

test("while editing, required gaps sit in the column and optional slots in the rail", () => {
  const onSlot = vi.fn();
  render(
    <OutfitLayout
      pieces={[piece("Oxford", "top")]}
      slots={[
        { category: "bottom", isRequired: true },
        { category: "shoes", isRequired: false },
      ]}
      onSlot={onSlot}
    />
  );
  expect(titlesIn("Main pieces")).toEqual(["Oxford", "Add a bottom"]);
  expect(titlesIn("Side pieces")).toEqual(["Add shoes"]);
  screen.getByRole("button", { name: "Add shoes" }).click();
  expect(onSlot).toHaveBeenCalledWith("shoes");
});

test("while editing, × takes a piece out", () => {
  const onRemove = vi.fn();
  const oxford = piece("Oxford", "top");
  render(<OutfitLayout pieces={[oxford]} onRemove={onRemove} />);
  screen.getByRole("button", { name: "Remove Oxford" }).click();
  expect(onRemove).toHaveBeenCalledWith(oxford);
});

test("a deleted bottom shows as a bottom gap in the column", () => {
  render(
    <OutfitLayout
      pieces={[piece("Blouse", "top"), piece("Bag", "accessory")]}
      missing={1}
      onMissing={vi.fn()}
    />
  );
  expect(titlesIn("Main pieces")).toEqual(["Blouse", "Pick a bottom"]);
  expect(titlesIn("Side pieces")).toEqual(["Bag"]);
});

test("a deleted piece that can't be told stays a plain rail gap", () => {
  render(
    <OutfitLayout
      pieces={[piece("Blouse", "top"), piece("Jeans", "bottom")]}
      missing={1}
      onMissing={vi.fn()}
    />
  );
  expect(titlesIn("Side pieces")).toEqual(["Pick a piece"]);
});
