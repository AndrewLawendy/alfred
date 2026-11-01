import { fireEvent, render, screen } from "@testing-library/react";

import PickerSheet from "pages/Outfits/PickerSheet";

test("the sheet grows and shrinks from its handle", () => {
  render(
    <PickerSheet>
      <p>Pieces</p>
    </PickerSheet>
  );
  const handle = screen.getByRole("button", { name: "Show more" });
  expect(handle).toHaveAttribute("aria-expanded", "false");
  fireEvent.click(handle);
  expect(screen.getByRole("button", { name: "Show less" })).toHaveAttribute(
    "aria-expanded",
    "true"
  );
});

test("dragging the handle up grows it, down shrinks it", () => {
  render(
    <PickerSheet>
      <p>Pieces</p>
    </PickerSheet>
  );
  const handle = screen.getByRole("button", { name: "Show more" });
  fireEvent.pointerDown(handle, { clientY: 500 });
  fireEvent.pointerUp(handle, { clientY: 380 });
  expect(handle).toHaveAttribute("aria-expanded", "true");
  fireEvent.pointerDown(handle, { clientY: 300 });
  fireEvent.pointerUp(handle, { clientY: 420 });
  expect(handle).toHaveAttribute("aria-expanded", "false");
});
