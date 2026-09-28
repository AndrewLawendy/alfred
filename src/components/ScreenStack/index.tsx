import { useEffect, useMemo, useRef, useState } from "react";
import { Drawer, DrawerContent, DrawerOverlay } from "@chakra-ui/react";

import { ScreenContext } from "components/Screen";
import Swipeable from "components/Swipeable";
import { ItemPanel } from "pages/Wardrobe/ItemScreen";
import { OutfitPanel } from "pages/Outfits/OutfitScreen";
import { closeScreen, StackEntry, useScreenStack } from "utils/history";

const keyOf = (entry: StackEntry) =>
  `${entry.kind}:${"id" in entry ? entry.id : entry.type}:${
    entry.depth ?? "link"
  }`;

type Rendered = { entry: StackEntry; isOpen: boolean };

// One full-screen drawer per open screen. Drawers opened later sit on top,
// so item → outfit → another item stacks in order; only the new one slides.
const ScreenDrawer = ({
  entry,
  isOpen,
  isBuried,
  onClosed,
}: {
  entry: StackEntry;
  isOpen: boolean;
  isBuried: boolean;
  onClosed: () => void;
}) => {
  const headingRef = useRef<HTMLParagraphElement>(null);
  // Keyed by identity: every stack snapshot hands over a fresh `entry`
  const key = keyOf(entry);
  const screen = useMemo(() => ({ close: () => closeScreen(entry) }), [key]);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={screen.close}
      onCloseComplete={onClosed}
      placement="right"
      size="full"
      initialFocusRef={headingRef}
    >
      <DrawerOverlay />
      <DrawerContent
        bg="transparent"
        boxShadow="none"
        // Covered by two or more screens: kept (scroll, edits), not drawn
        sx={{ visibility: isBuried ? "hidden" : "visible" }}
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
      </DrawerContent>
    </Drawer>
  );
};

// Item and outfit screens, stacked in the order they were opened. The stack
// lives in the history entries, so Back, Forward and swipe-back peel exactly
// one screen at a time. A popped screen stays rendered until it has slid away.
const ScreenStack = () => {
  const stack = useScreenStack();
  const [rendered, setRendered] = useState<Rendered[]>(() =>
    stack.map((entry) => ({ entry, isOpen: true }))
  );

  useEffect(() => {
    setRendered((previous) => {
      const keys = new Set(stack.map(keyOf));
      return [
        ...stack.map((entry) => ({ entry, isOpen: true })),
        ...previous
          .filter(({ entry }) => !keys.has(keyOf(entry)))
          .map(({ entry }) => ({ entry, isOpen: false })),
      ];
    });
  }, [stack]);

  return (
    <>
      {rendered.map(({ entry, isOpen }, index) => (
        <ScreenDrawer
          key={keyOf(entry)}
          entry={entry}
          isOpen={isOpen}
          isBuried={isOpen && index < stack.length - 2}
          onClosed={() =>
            setRendered((current) =>
              current.filter((item) => keyOf(item.entry) !== keyOf(entry))
            )
          }
        />
      ))}
    </>
  );
};

export default ScreenStack;
