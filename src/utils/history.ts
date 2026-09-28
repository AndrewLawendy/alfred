import { useMemo, useSyncExternalStore } from "react";

import { Item } from "utils/types";

// Anything opened on top of a page (a screen, a sheet, edit mode) pushes a
// history entry, so Back closes the topmost layer instead of leaving the page.
// Each entry records its depth and the stack of screens (items and outfits)
// open at that point, so screens can pile up (item → outfit → item → …) and
// Back peels exactly one off. The URL shows only the top screen.
export type Screen =
  | { kind: "item"; id: string }
  | { kind: "new"; type: Item["type"] }
  | { kind: "outfit"; id: string };

// depth: the history entry the screen was pushed with; null when it has none
// of its own (opened from a link, or swapped in place)
export type StackEntry = Screen & { depth: number | null };

type LayerState = { depth?: number; stack?: StackEntry[] };

// Search params that describe a screen (the rest belong to the page)
const screenParams = ["item", "new", "outfit", "shared"];

const current = (): LayerState => window.history.state || {};

export const layerDepth = () => current().depth ?? 0;

// Screens named in the URL, for a link opened without our history state
const stackFromUrl = (): StackEntry[] => {
  const params = new URLSearchParams(window.location.search);
  const outfit = params.get("outfit");
  const item = params.get("item");
  const type = params.get("new") as Item["type"] | null;
  return [
    ...(outfit ? [{ kind: "outfit" as const, id: outfit, depth: null }] : []),
    ...(item ? [{ kind: "item" as const, id: item, depth: null }] : []),
    ...(type ? [{ kind: "new" as const, type, depth: null }] : []),
  ];
};

const currentStack = () => current().stack ?? stackFromUrl();

// The page's own params plus the ones for `screen` (e.g. ?item=abc)
const urlFor = (screen?: Screen, extra?: Record<string, string>) => {
  const params = new URLSearchParams(window.location.search);
  screenParams.forEach((param) => params.delete(param));
  if (screen?.kind === "item") params.set("item", screen.id);
  if (screen?.kind === "new") params.set("new", screen.type);
  if (screen?.kind === "outfit") params.set("outfit", screen.id);
  Object.entries(extra ?? {}).forEach(([key, value]) => params.set(key, value));
  const search = params.toString();
  return window.location.pathname + (search ? `?${search}` : "");
};

export const pushLayer = (url?: string, screen?: Screen) => {
  const depth = layerDepth() + 1;
  const stack = [...currentStack(), ...(screen ? [{ ...screen, depth }] : [])];
  window.history.pushState({ depth, stack }, "", url);
  return depth;
};

const openScreen = (screen: Screen) => pushLayer(urlFor(screen), screen);

export const openItem = (id: string) => openScreen({ kind: "item", id });
export const openNewItem = (type: Item["type"]) =>
  openScreen({ kind: "new", type });
export const openOutfit = (id: string) => openScreen({ kind: "outfit", id });
export const openNewOutfit = () => openOutfit("new");

// Show a screen without a history entry of its own (the Add to wardrobe
// chooser swaps itself for the new item's screen)
export const showScreenInPlace = (
  screen: Screen,
  pathname: string,
  extra?: Record<string, string>
) => {
  const stack = [...currentStack(), { ...screen, depth: null }];
  // A fresh URL: the page it replaces (the chooser's ?add=1) is gone
  const params = new URLSearchParams(extra);
  if (screen.kind === "item") params.set("item", screen.id);
  if (screen.kind === "new") params.set("new", screen.type);
  if (screen.kind === "outfit") params.set("outfit", screen.id);
  window.history.replaceState(
    { ...current(), stack },
    "",
    `${pathname}?${params}`
  );
};

// Close a screen and everything opened above it (edit mode, sheets, screens)
export const closeScreen = (entry: StackEntry) => {
  const depth = layerDepth();
  if (entry.depth !== null && depth >= entry.depth) {
    window.history.go(-(depth - entry.depth + 1));
    return;
  }
  // No entry of its own: drop it (and anything above) from the stack in place
  const stack = currentStack();
  const index = stack.findIndex(
    (screen) => screen.kind === entry.kind && screen.depth === entry.depth
  );
  const remaining = index === -1 ? stack : stack.slice(0, index);
  window.history.replaceState(
    { ...current(), stack: remaining },
    "",
    urlFor(remaining[remaining.length - 1])
  );
};

// wouter dispatches pushState/replaceState events; the browser dispatches popstate
const events = ["popstate", "pushState", "replaceState"];
const subscribe = (onChange: () => void) => {
  events.forEach((event) => window.addEventListener(event, onChange));
  return () =>
    events.forEach((event) => window.removeEventListener(event, onChange));
};

// The screens open right now, bottom to top
export const useScreenStack = () => {
  const snapshot = useSyncExternalStore(subscribe, () =>
    JSON.stringify(currentStack())
  );
  return useMemo(() => JSON.parse(snapshot) as StackEntry[], [snapshot]);
};

const useSearchParams = () =>
  new URLSearchParams(
    useSyncExternalStore(subscribe, () => window.location.search)
  );

export const useSearchParam = (name: string) => useSearchParams().get(name);

// Swap one query for another without adding a history entry
export const replaceSearch = (search: string) =>
  window.history.replaceState(
    window.history.state,
    "",
    window.location.pathname + (search ? `?${search}` : "")
  );
