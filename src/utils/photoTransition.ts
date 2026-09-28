import { useSyncExternalStore } from "react";
import { flushSync } from "react-dom";

import { openItem } from "utils/history";

// A tapped photo grows into the item's page, and shrinks back into its tile
// on Back, using the browser's View Transitions (Chrome 111+, Safari 18+).
// The browser snapshots both photos and morphs one into the other on the GPU;
// elsewhere, and with reduced motion, screens slide as usual.
//
// Sources (tiles) carry data-photo-source=<item id>; the item page's photo
// carries data-photo-target=<item id>. The shared name is set only for the
// moment of the transition, since two elements can't share it.
const NAME = "item-photo";

type ViewTransition = { finished: Promise<void> };
type WithViewTransitions = Document & {
  startViewTransition?: (update: () => void | Promise<void>) => ViewTransition;
};

const isSupported = () =>
  Boolean((document as WithViewTransitions).startViewTransition) &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// While a photo morphs, screens appear in place instead of sliding in: the
// app's MotionConfig switches to reducedMotion "always" (moves become instant,
// fades stay), and the browser does the motion
let isInstant = false;
const listeners = new Set<() => void>();
const setInstant = (value: boolean) => {
  isInstant = value;
  listeners.forEach((listener) => listener());
};
export const useInstantMotion = () =>
  useSyncExternalStore(
    (onChange) => {
      listeners.add(onChange);
      return () => listeners.delete(onChange);
    },
    () => isInstant
  );

const setName = (element: HTMLElement | null | undefined, name: string) => {
  if (element) element.style.setProperty("view-transition-name", name);
};

// The photo on the item page, once it's in the DOM and decoded, or null after
// a short wait. Polls with timers: the browser pauses rendering (and with it
// requestAnimationFrame) while it prepares a view transition.
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForTarget = async (id: string) => {
  const started = performance.now();
  while (performance.now() - started < 400) {
    const target = document.querySelector<HTMLImageElement>(
      `[data-photo-target="${id}"]`
    );
    if (target) {
      // A slow photo mustn't hold the screen: give decoding 200ms at most
      await Promise.race([target.decode().catch(() => undefined), sleep(200)]);
      return target;
    }
    await sleep(16);
  }
  return null;
};

export const openItemFromPhoto = (id: string, photo?: HTMLElement | null) => {
  const start = (document as WithViewTransitions).startViewTransition;
  if (!photo || !start || !isSupported()) {
    openItem(id);
    return;
  }
  let target: HTMLElement | null = null;
  setName(photo, NAME);
  const transition = start.call(document, async () => {
    setName(photo, "");
    flushSync(() => {
      setInstant(true);
      openItem(id);
    });
    target = await waitForTarget(id);
    setName(target, NAME);
  });
  transition.finished.finally(() => {
    setName(target, "");
    setInstant(false);
  });
};

// The tile to shrink back into: the last visible one for this item, which
// sits in the page or screen that's left on top (not in the page closing)
const findSource = (id: string, closing: Element | null) =>
  Array.from(
    document.querySelectorAll<HTMLElement>(`[data-photo-source="${id}"]`)
  )
    .filter(
      (element) =>
        !closing?.contains(element) &&
        element.getClientRects().length > 0 &&
        getComputedStyle(element).visibility === "visible"
    )
    .pop();

// Close an item page by shrinking its photo back into its tile. `remove`
// takes the page out of the DOM at once (no slide). False when there's
// nothing to morph between, so the caller slides it away instead.
export const closeItemToPhoto = (id: string, remove: () => void) => {
  const start = (document as WithViewTransitions).startViewTransition;
  const target = document.querySelector<HTMLElement>(
    `[data-photo-target="${id}"]`
  );
  const source = findSource(
    id,
    target?.closest(".chakra-modal__content") ?? null
  );
  if (!start || !isSupported() || !target || !source) return false;

  setName(target, NAME);
  const transition = start.call(document, () => {
    setName(target, "");
    flushSync(remove);
    setName(source, NAME);
  });
  transition.finished.finally(() => setName(source, ""));
  return true;
};

// A swipe-back follows the finger, so it keeps the slide
let swipedAt = 0;
export const markSwipe = () => {
  swipedAt = Date.now();
};
export const wasSwiped = () => Date.now() - swipedAt < 1000;
