import { memo, ReactNode, useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { ScreenContext } from "components/Screen";
import Swipeable from "components/Swipeable";
import { ItemPanel } from "pages/Wardrobe/ItemScreen";
import { OutfitPanel } from "pages/Outfits/OutfitScreen";
import { closeScreen, StackEntry, useScreenStack } from "utils/history";

// How iOS pushes a screen: in from the right, the one below eases a third to
// the left and dims; popping reverses it
export const PARALLAX = "-30%";
export const SCREEN_TRANSITION = {
  type: "tween",
  duration: 0.32,
  ease: [0.32, 0.72, 0, 1],
};
const transition = SCREEN_TRANSITION;

const keyOf = (entry: StackEntry) =>
  `${entry.kind}:${"id" in entry ? entry.id : entry.type}:${
    entry.depth ?? "link"
  }`;

type LayerProps = {
  entry: StackEntry;
  index: number;
  isTop: boolean;
  // Fully covered by two or more screens: kept (scroll, edits) but not drawn,
  // so the phone isn't compositing a pile of full-screen photos
  isBuried: boolean;
};

function Layer({ entry, index, isTop, isBuried }: LayerProps) {
  const headingRef = useRef<HTMLParagraphElement>(null);
  const key = keyOf(entry);
  // Keyed by identity: each stack snapshot hands over a fresh `entry` object
  const screen = useMemo(() => ({ close: () => closeScreen(entry) }), [key]);

  // Start at the title, like a new page, without scrolling anything
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <motion.div
      role="dialog"
      aria-modal={isTop}
      aria-hidden={!isTop}
      initial={{ x: "100%" }}
      animate={{ x: isTop ? 0 : PARALLAX }}
      exit={{ x: "100%" }}
      transition={transition}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1250 + index,
        display: "flex",
        flexDirection: "column",
        visibility: isBuried ? "hidden" : "visible",
      }}
    >
      <ScreenContext.Provider value={screen}>
        <Swipeable direction="right" onClose={screen.close}>
          {entry.kind === "outfit" ? (
            <OutfitPanel param={entry.id} headingRef={headingRef} />
          ) : (
            <ItemPanel
              itemId={entry.kind === "item" ? entry.id : null}
              newType={entry.kind === "new" ? entry.type : null}
              headingRef={headingRef}
            />
          )}
        </Swipeable>
      </ScreenContext.Provider>
      {/* Dims this screen while another sits on top of it */}
      <motion.div
        aria-hidden
        initial={false}
        animate={{ opacity: isTop ? 0 : 1 }}
        transition={transition}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(21, 23, 28, 0.25)",
          pointerEvents: isTop ? "none" : "auto",
        }}
      />
    </motion.div>
  );
}

// Stack snapshots are fresh objects; re-render a layer only when what it
// shows changes
const MemoLayer = memo(
  Layer,
  (before, after) =>
    keyOf(before.entry) === keyOf(after.entry) &&
    before.index === after.index &&
    before.isTop === after.isTop &&
    before.isBuried === after.isBuried
);

// The page under the screens: eases left under the first one, and isn't
// drawn once two screens cover it
export const PageUnderScreens = ({ children }: { children: ReactNode }) => {
  const { length } = useScreenStack();
  return (
    <motion.div
      animate={{ x: length ? PARALLAX : 0 }}
      transition={SCREEN_TRANSITION}
      style={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        visibility: length >= 2 ? "hidden" : "visible",
      }}
    >
      {children}
    </motion.div>
  );
};

// Item and outfit screens, stacked in the order they were opened. The stack
// lives in the history entries, so Back, Forward and swipe-back peel exactly
// one screen at a time.
const ScreenStack = () => {
  const stack = useScreenStack();

  // The page underneath doesn't scroll while a screen covers it
  useEffect(() => {
    document.documentElement.style.overflow = stack.length ? "hidden" : "";
  }, [stack.length]);

  return (
    <AnimatePresence initial={false}>
      {stack.map((entry, index) => (
        <MemoLayer
          key={keyOf(entry)}
          entry={entry}
          index={index}
          isTop={index === stack.length - 1}
          isBuried={index < stack.length - 2}
        />
      ))}
    </AnimatePresence>
  );
};

export default ScreenStack;
