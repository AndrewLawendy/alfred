import { render, screen } from "@testing-library/react";

import Laundry from "pages/Account/Laundry";
import { saveLimits } from "resources/useLimits";

// Settings not loaded yet: the screen shows the defaults
vi.mock("resources/useLimits", () => ({
  default: () => ({ shirt: 1, pants: 3 }),
  useLimitsState: () => ({ limits: { shirt: 1, pants: 3 }, isLoading: false }),
  saveLimits: vi.fn(() => Promise.resolve()),
}));
vi.mock("hooks/useNotice", () => ({ default: () => () => undefined }));

test("changing one type's limit never writes the other type's shown value", () => {
  render(<Laundry />);
  screen.getByRole("button", { name: "More wears for shirts" }).click();
  expect(vi.mocked(saveLimits)).toHaveBeenCalledWith({ shirt: 2 });
});
