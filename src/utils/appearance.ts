import type { ComponentProps } from "react";
import type { ChakraProvider } from "@chakra-ui/react";

type StorageManager = NonNullable<
  ComponentProps<typeof ChakraProvider>["colorModeManager"]
>;

// Light, dark, or following the phone ("system", the default). Stored here
// rather than by Chakra, which saves only the resolved mode and so forgets
// "system" and stops following the phone.
export type Appearance = "system" | "light" | "dark";

const KEY = "alfred-appearance";
const darkQuery = "(prefers-color-scheme: dark)";

export const readAppearance = (): Appearance => {
  try {
    const value = localStorage.getItem(KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
};

export const resolveAppearance = (appearance: Appearance) =>
  appearance === "system"
    ? window.matchMedia(darkQuery).matches
      ? "dark"
      : "light"
    : appearance;

export const saveAppearance = (appearance: Appearance) => {
  try {
    if (appearance === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, appearance);
  } catch {
    // Not remembered; this session still uses it
  }
};

// Calls back when the phone switches between light and dark
export const onSystemChange = (callback: () => void) => {
  const query = window.matchMedia(darkQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
};

// The browser's status bar and task switcher colour: the page colour
export const setBrowserColour = (mode: "light" | "dark") => {
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", mode === "dark" ? PAGE_DARK : PAGE_LIGHT);
};

// The page colours, shared with the theme (index.html repeats the dark one)
export const PAGE_LIGHT = "#EEEDE9";
export const PAGE_DARK = "#15171C";

// Chakra reads the mode from here, so it starts from the resolved choice.
// It never writes: the choice itself is only saved by saveAppearance.
export const appearanceManager: StorageManager = {
  type: "localStorage",
  get: () => resolveAppearance(readAppearance()),
  set: () => undefined,
};
