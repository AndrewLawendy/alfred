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

test("the Photo tab offers to take or choose a photo", () => {
  render(
    <Picker
      items={items}
      picks={[]}
      active="photo"
      onTab={vi.fn()}
      onPick={vi.fn()}
      photo={{ onPick: vi.fn(), onRemove: vi.fn() }}
    />
  );
  expect(screen.getByRole("tab", { name: /Photo/ })).toHaveAttribute(
    "aria-selected",
    "true"
  );
  expect(screen.getByRole("button", { name: "Take photo" })).toBeTruthy();
  expect(
    screen.getByRole("button", { name: "Choose from library" })
  ).toBeTruthy();
});

test("with a photo, the Photo tab can remove it", () => {
  const onRemove = vi.fn();
  render(
    <Picker
      items={items}
      picks={[]}
      active="photo"
      onTab={vi.fn()}
      onPick={vi.fn()}
      photo={{ url: "https://p", onPick: vi.fn(), onRemove }}
    />
  );
  screen.getByRole("button", { name: "Remove photo" }).click();
  expect(onRemove).toHaveBeenCalled();
});
