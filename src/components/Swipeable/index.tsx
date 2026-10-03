import { ReactNode } from "react";
import { motion, useDragControls } from "framer-motion";

type SwipeableProps = {
  // "right": full screens, swiped back from the left edge (like iOS)
  // "down": bottom sheets, dragged down to dismiss
  direction: "right" | "down";
  onClose: () => void;
  // Bottom sheets with a scrolling list: drag only from the top strip, so
  // the list scrolls instead of moving the sheet
  isHandleOnly?: boolean;
  children: ReactNode;
};

// How far (px) or how fast (px/s) a swipe must go before it closes
const DISTANCE = 100;
const SPEED = 500;

const Swipeable = ({
  direction,
  onClose,
  isHandleOnly = false,
  children,
}: SwipeableProps) => {
  const controls = useDragControls();
  const isBack = direction === "right";

  return (
    <motion.div
      drag={isBack ? "x" : "y"}
      dragControls={controls}
      // Back swipes start only from the edge strip, so scrolling and form input are untouched
      dragListener={!isBack && !isHandleOnly}
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      // Follow the finger in the closing direction only
      dragElastic={isBack ? { left: 0, right: 1 } : { top: 0, bottom: 1 }}
      onDragEnd={(_, { offset, velocity }) => {
        const distance = isBack ? offset.x : offset.y;
        const speed = isBack ? velocity.x : velocity.y;
        if (distance > DISTANCE || speed > SPEED) onClose();
      }}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        height: isBack ? "100%" : undefined,
        background: "var(--chakra-colors-page)",
        ...(isBack
          ? { boxShadow: "-8px 0 24px rgba(0, 0, 0, 0.12)" }
          : {
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              // A tall sheet stops short of the top and scrolls inside
              maxHeight: "90dvh",
              paddingBottom: "env(safe-area-inset-bottom)",
            }),
      }}
    >
      {isBack ? (
        <div
          aria-hidden
          onPointerDown={(event) => controls.start(event)}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            width: 24,
            zIndex: 2,
            touchAction: "none",
          }}
        />
      ) : (
        <div
          aria-hidden
          {...(isHandleOnly && {
            onPointerDown: (event: React.PointerEvent) => controls.start(event),
          })}
          style={{
            // A full-width strip to grab when only the handle drags
            padding: isHandleOnly ? "8px 0" : "8px 0 0",
            touchAction: isHandleOnly ? "none" : undefined,
          }}
        >
          <div
            style={{
              width: 36,
              height: 5,
              margin: "0 auto",
              borderRadius: 999,
              background: "var(--chakra-colors-gray-300)",
            }}
          />
        </div>
      )}
      {children}
    </motion.div>
  );
};

export default Swipeable;
