import { render, screen } from "@testing-library/react";

import Laundry from "pages/Account/Laundry";
import { saveLimits } from "resources/useLimits";

// The screen shows the defaults
vi.mock("resources/useLimits", () => ({
  useLimitsState: () => ({
    limits: { top: 1, dress: 1, bottom: 3, layer: 5, shoes: 0, accessory: 0 },
    isLoading: false,
  }),
  saveLimits: vi.fn(() => Promise.resolve()),
}));
vi.mock("hooks/useNotice", () => ({ default: () => () => undefined }));

test("changing one category's limit never writes another category's shown value", () => {
  render(<Laundry />);
  screen.getByRole("button", { name: "More wears for tops" }).click();
  expect(vi.mocked(saveLimits)).toHaveBeenCalledWith({ top: 2 });
});

test("not counted is the lowest step, and counting starts from it", () => {
  render(<Laundry />);
  expect(screen.getAllByText("Not counted")).toHaveLength(2);
  expect(
    screen.getByRole("button", { name: "Fewer wears for accessories" })
  ).toBeDisabled();
  screen.getByRole("button", { name: "More wears for accessories" }).click();
  expect(vi.mocked(saveLimits)).toHaveBeenLastCalledWith({ accessory: 1 });
});
