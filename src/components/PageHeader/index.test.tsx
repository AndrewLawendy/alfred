import { render, screen } from "@testing-library/react";

import PageHeader from "components/PageHeader";

// jsdom has no layout: the bar ends 52px down, and every other element sits
// where the test puts the big title
// The title rests 120px down, so a title higher than that means the page has
// scrolled by the difference
const REST = 120;
const titleAt = (top: number) => {
  Object.defineProperty(window, "scrollY", {
    value: REST - top,
    configurable: true,
  });
  return vi
    .spyOn(Element.prototype, "getBoundingClientRect")
    .mockImplementation(function (this: Element) {
      return (
        this.getAttribute("data-testid") === "compact-header"
          ? { top: 0, bottom: 52, height: 52, left: 0 }
          : { top, bottom: top + 40, height: 40, left: 0 }
      ) as DOMRect;
    });
};

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

test("the main button moves into the bar with the title, rather than appearing twice", () => {
  titleAt(120);
  const { unmount } = render(
    <PageHeader title="Wardrobe" action={<button>Add shirt</button>} />
  );
  expect(screen.getByTestId("compact-action").style.visibility).toBe("hidden");
  expect(screen.getByTestId("page-action").style.opacity).toBe("");
  unmount();

  titleAt(32); // halfway into the bar
  render(<PageHeader title="Wardrobe" action={<button>Add shirt</button>} />);
  expect(screen.getByTestId("compact-action").style.visibility).toBe("visible");
  expect(screen.getByTestId("compact-action").style.transform).toMatch(
    /translate/
  );
  expect(screen.getByTestId("page-action").style.opacity).toBe("0");
});

test("the morph re-measures when the header changes size, not only on scroll", () => {
  // The eyebrow loads after the page opens and pushes the title down
  let onResize: () => void = () => undefined;
  window.ResizeObserver = class {
    constructor(callback: () => void) {
      onResize = callback;
    }
    observe() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((step) => {
    step(0);
    return 1;
  });

  titleAt(32); // first measured while the page was still filling in
  render(<PageHeader title="Wardrobe" action={<button>Add shirt</button>} />);
  expect(screen.getByTestId("page-action").style.opacity).toBe("0");

  titleAt(120); // the title's real place, once the eyebrow is in
  onResize();
  expect(screen.getByTestId("page-action").style.opacity).toBe("");
  expect(screen.getByTestId("compact-action").style.visibility).toBe("hidden");
});
