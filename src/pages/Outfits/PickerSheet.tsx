import { ReactNode, useRef, useState } from "react";
import { Box, Flex } from "@chakra-ui/react";

// How far a drag must travel to change the sheet's height
const DRAG = 40;

// The editor's sheet: one steady height, or taller on demand from its handle
// (tap, or drag up and down), to see more of the wardrobe at once
const PickerSheet = ({ children }: { children: ReactNode }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const startY = useRef<number>();
  // A drag already decided; the click that follows it shouldn't toggle back
  const wasDragged = useRef(false);

  return (
    <>
      <Flex
        as="button"
        aria-label={isExpanded ? "Show less" : "Show more"}
        aria-expanded={isExpanded}
        onClick={() => {
          if (wasDragged.current) {
            wasDragged.current = false;
            return;
          }
          setIsExpanded(!isExpanded);
        }}
        onPointerDown={(event: React.PointerEvent) => {
          startY.current = event.clientY;
        }}
        onPointerUp={(event: React.PointerEvent) => {
          if (startY.current === undefined) return;
          const moved = event.clientY - startY.current;
          startY.current = undefined;
          if (Math.abs(moved) < DRAG) return;
          wasDragged.current = true;
          setIsExpanded(moved < 0);
        }}
        sx={{
          w: "100%",
          justifyContent: "center",
          pt: 1,
          pb: 2,
          touchAction: "none",
        }}
      >
        <Box
          sx={{ w: 10, h: 1.5, borderRadius: "full", backgroundColor: "line" }}
        />
      </Flex>
      <Flex
        sx={{
          h: isExpanded ? "80dvh" : "44dvh",
          flexDirection: "column",
          transition: "height 0.2s ease",
        }}
      >
        {children}
      </Flex>
    </>
  );
};

export default PickerSheet;
