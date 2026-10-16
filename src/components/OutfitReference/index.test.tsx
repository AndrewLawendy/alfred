import { render, screen } from "@testing-library/react";
import { useDocumentData } from "react-firebase-hooks/firestore";

import OutfitReference from "components/OutfitReference";

// With no reference the hook reports loading, which used to reach reference.id
vi.mock("react-firebase-hooks/firestore", () => ({
  useDocumentData: vi.fn(() => [undefined, true]),
}));

test("an outfit without this piece shows the gap to pick one, instead of crashing", () => {
  const onMissing = vi.fn();
  render(<OutfitReference slot="belt" isLabelled onMissing={onMissing} />);
  expect(useDocumentData).toHaveBeenCalledWith(undefined);
  screen.getByRole("button", { name: /Pick a belt/ }).click();
  expect(onMissing).toHaveBeenCalled();
});
