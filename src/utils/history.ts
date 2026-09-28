import { useSyncExternalStore } from "react";

import { Item } from "utils/types";

// Anything opened on top of a page (item or outfit screen, sheet, edit mode)
// pushes a history entry, so Back closes the topmost layer instead of leaving
// the page. Each entry records its depth, and every entry remembers the depth
// at which each screen (item, outfit) was opened, so closing a screen can pop
// it together with anything opened above it.
type Screen = "item" | "outfit";
type LayerState = { depth?: number; screens?: Partial<Record<Screen, number>> };

// Which search params belong to each screen
const screenParams: Record<Screen, string[]> = {
  item: ["item", "new", "shared"],
  outfit: ["outfit"],
};

const current = (): LayerState => window.history.state || {};

export const layerDepth = () => current().depth ?? 0;

export const pushLayer = (url?: string, screen?: Screen) => {
  const depth = layerDepth() + 1;
  const screens = { ...current().screens, ...(screen && { [screen]: depth }) };
  window.history.pushState({ depth, screens }, "", url);
  return depth;
};

const urlWith = (screen: Screen, key: string, value: string) => {
  const params = new URLSearchParams(window.location.search);
  screenParams[screen].forEach((param) => params.delete(param));
  params.set(key, value);
  return `${window.location.pathname}?${params}`;
};

const urlWithout = (screen: Screen) => {
  const params = new URLSearchParams(window.location.search);
  screenParams[screen].forEach((param) => params.delete(param));
  const search = params.toString();
  return window.location.pathname + (search ? `?${search}` : "");
};

const closeScreen = (screen: Screen) => {
  const { depth = 0, screens } = current();
  const openedAt = screens?.[screen];
  if (openedAt && depth >= openedAt) {
    // Pop the screen's entry and anything opened above it (edit mode, sheets)
    window.history.go(-(depth - openedAt + 1));
  } else {
    // Opened straight from a link: there is no entry of ours to go back to
    window.history.replaceState(window.history.state, "", urlWithout(screen));
  }
};

// Item screen: ?item=<id>, or ?new=<type> to add one
export const openItem = (id: string) =>
  pushLayer(urlWith("item", "item", id), "item");
export const openNewItem = (type: Item["type"]) =>
  pushLayer(urlWith("item", "new", type), "item");
export const closeItem = () => closeScreen("item");

// Outfit screen: ?outfit=<id>, or ?outfit=new to build one
export const openOutfit = (id: string) =>
  pushLayer(urlWith("outfit", "outfit", id), "outfit");
export const openNewOutfit = () => openOutfit("new");
export const closeOutfit = () => closeScreen("outfit");

// wouter dispatches pushState/replaceState events; the browser dispatches popstate
const events = ["popstate", "pushState", "replaceState"];
const subscribe = (onChange: () => void) => {
  events.forEach((event) => window.addEventListener(event, onChange));
  return () =>
    events.forEach((event) => window.removeEventListener(event, onChange));
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

export const useItemRoute = () => {
  const params = useSearchParams();
  return {
    itemId: params.get("item"),
    newType: params.get("new") as Item["type"] | null,
  };
};

export const useOutfitRoute = () => useSearchParams().get("outfit");
