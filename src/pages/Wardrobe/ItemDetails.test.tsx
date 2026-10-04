import { fireEvent, render, screen } from "@testing-library/react";

import ItemDetails from "pages/Wardrobe/ItemDetails";
import { Item } from "utils/types";

const updateOutfits = vi.fn(() => Promise.resolve());
vi.mock("resources/useOutfits", () => ({ default: () => [[], false] }));
vi.mock("resources/useLimits", () => ({ default: () => ({ bottom: 3 }) }));
vi.mock("resources/useUpdateOutfits", () => ({
  default: () => [updateOutfits, false],
}));
vi.mock("hooks/useNotice", () => ({ default: () => () => undefined }));

const chinos = {
  id: "chinos",
  type: "bottom",
  title: "Grey chinos",
  description: "",
  imageUrl: "",
} as Item;

test("a piece can wash on its own count, or go back to its category's", () => {
  render(<ItemDetails item={chinos} />);
  const select = screen.getByLabelText("Wears before washing");
  expect(screen.getByRole("option", { name: "Default (3)" })).toBeTruthy();

  fireEvent.change(select, { target: { value: "0" } });
  expect(updateOutfits).toHaveBeenLastCalledWith([], undefined, [
    { id: "chinos", changes: { wearLimit: 0 } },
  ]);

  fireEvent.change(select, { target: { value: "" } });
  expect(updateOutfits).toHaveBeenLastCalledWith([], undefined, [
    { id: "chinos", changes: { wearLimit: null } },
  ]);
});
