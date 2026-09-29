// jest-dom's matchers (toBeInTheDocument and friends) for Vitest
import "@testing-library/jest-dom/vitest";

// jsdom has no matchMedia: behave like a phone in light mode with no
// preferences (tests that care replace it)
window.matchMedia = (query: string) =>
  ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  }) as MediaQueryList;
