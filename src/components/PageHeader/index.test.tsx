import { render, screen } from "@testing-library/react";

import PageHeader from "components/PageHeader";

// jsdom has no IntersectionObserver: this one says straight away whether the
// big title is in view
let isTitleInView = true;
beforeEach(() => {
  window.IntersectionObserver = class {
    constructor(private callback: IntersectionObserverCallback) {}
    observe() {
      this.callback(
        [{ isIntersecting: isTitleInView } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver
      );
    }
    disconnect() {}
  } as unknown as typeof IntersectionObserver;
});

const compactBar = () => screen.getByTestId("compact-header");

test("the slim title bar stays hidden while the big title is in view", () => {
  isTitleInView = true;
  render(<PageHeader title="Wardrobe" />);
  expect(compactBar().getAttribute("aria-hidden")).toBe("true");
});

test("the slim title bar shows once the big title scrolls away", () => {
  isTitleInView = false;
  render(<PageHeader title="Wardrobe" action={<button>Add shirt</button>} />);
  expect(compactBar().getAttribute("aria-hidden")).toBeNull();
  expect(compactBar().textContent).toContain("Wardrobe");
  expect(compactBar().textContent).toContain("Add shirt");
});
