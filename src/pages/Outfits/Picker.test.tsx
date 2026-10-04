import { render, screen } from "@testing-library/react";

import Picker from "pages/Outfits/Picker";
import { Item } from "utils/types";

const piece = (id: string, type: Item["type"]) =>
  ({ id, type, title: id, description: "", imageUrl: "" }) as Item;

const items = [
  piece("Oxford", "top"),
  piece("Polo", "top"),
  piece("Jeans", "bottom"),
  piece("Blazer", "layer"),
  piece("Sneakers", "shoes"),
  piece("Belt", "accessory"),
  piece("Watch", "accessory"),
  piece("Scarf", "accessory"),
];

test("tapping a piece picks it", () => {
  const onPick = vi.fn();
  render(
    <Picker
      items={items}
      picks={["Oxford"]}
      active="top"
      onTab={vi.fn()}
      onPick={onPick}
    />
  );
  expect(screen.getByRole("tab", { name: /Tops/ })).toHaveAttribute(
    "aria-selected",
    "true"
  );
  screen.getByRole("button", { name: "Polo" }).click();
  expect(onPick).toHaveBeenCalledWith("Polo");
});

test("at 6 pieces, only swaps are left", () => {
  const six = ["Oxford", "Jeans", "Blazer", "Sneakers", "Belt", "Watch"];
  const { rerender } = render(
    <Picker
      items={items}
      picks={six}
      active="accessory"
      onTab={vi.fn()}
      onPick={vi.fn()}
    />
  );
  expect(screen.getByRole("button", { name: "Scarf" })).toBeDisabled();
  expect(screen.getByText("Up to 6 pieces")).toBeTruthy();
  rerender(
    <Picker
      items={items}
      picks={six}
      active="top"
      onTab={vi.fn()}
      onPick={vi.fn()}
    />
  );
  expect(screen.getByRole("button", { name: "Polo" })).toBeEnabled();
});
