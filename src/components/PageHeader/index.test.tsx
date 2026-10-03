import { render, screen } from "@testing-library/react";

import PageHeader from "components/PageHeader";

// jsdom has no layout: the bar ends 52px down, and every other element sits
// where the test puts the big title
const titleAt = (top: number) =>
  vi
    .spyOn(Element.prototype, "getBoundingClientRect")
    .mockImplementation(function (this: Element) {
      return (
        this.getAttribute("data-testid") === "compact-header"
          ? { top: 0, bottom: 52, height: 52, left: 0 }
          : { top, bottom: top + 40, height: 40, left: 0 }
      ) as DOMRect;
    });

afterEach(() => vi.restoreAllMocks());

const compactBar = () => screen.getByTestId("compact-header");

test("the slim title bar stays hidden while the big title is in view", () => {
  titleAt(120);
  render(<PageHeader title="Wardrobe" />);
  expect(compactBar().getAttribute("aria-hidden")).toBe("true");
});

test("the slim title bar shows once the big title has scrolled into it", () => {
  // A full title height past the bar's bottom edge
  titleAt(12);
  render(<PageHeader title="Wardrobe" action={<button>Add shirt</button>} />);
  expect(compactBar().getAttribute("aria-hidden")).toBeNull();
  expect(compactBar().textContent).toContain("Wardrobe");
  expect(compactBar().textContent).toContain("Add shirt");
});
