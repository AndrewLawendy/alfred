import { useSyncExternalStore } from "react";

import { Item } from "utils/types";

// Anything opened on top of a page (item screen, outfit screen, sheet) pushes a
// history entry, so Back closes the topmost layer instead of leaving the page.
// Each entry records its depth, and every entry opened while an item is showing
// remembers where the item's entry sits, so closing the item can pop them all.
type LayerState = { depth?: number; itemDepth?: number };

const current = (): LayerState => window.history.state || {};

export const layerDepth = () => current().depth ?? 0;

export const pushLayer = (url?: string, isItem = false) => {
  const depth = layerDepth() + 1;
  const itemDepth = isItem ? depth : current().itemDepth;
  window.history.pushState({ depth, itemDepth }, "", url);
  return depth;
};

// Item screen: lives in the URL (?item=<id> or ?new=<type>) on top of any page
const withSearch = (search: string) => window.location.pathname + search;

export const openItem = (id: string) =>
  pushLayer(withSearch(`?item=${encodeURIComponent(id)}`), true);

export const openNewItem = (type: Item["type"]) =>
  pushLayer(withSearch(`?new=${type}`), true);

export const closeItem = () => {
  const { depth = 0, itemDepth } = current();
  if (itemDepth && depth >= itemDepth) {
    // Pop the item's entry and anything opened above it (edit mode, sheets)
    window.history.go(-(depth - itemDepth + 1));
  } else {
    // Opened straight from a link: there is no entry of ours to go back to
    window.history.replaceState(null, "", window.location.pathname);
  }
};

// wouter dispatches pushState/replaceState events; the browser dispatches popstate
const events = ["popstate", "pushState", "replaceState"];
const subscribe = (onChange: () => void) => {
  events.forEach((event) => window.addEventListener(event, onChange));
  return () =>
    events.forEach((event) => window.removeEventListener(event, onChange));
};

export const useItemRoute = () => {
  const search = useSyncExternalStore(subscribe, () => window.location.search);
  const params = new URLSearchParams(search);
  return {
    itemId: params.get("item"),
    newType: params.get("new") as Item["type"] | null,
  };
};
