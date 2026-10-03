import { Box, Flex, Icon, Text } from "@chakra-ui/react";
import { MdChevronRight } from "react-icons/md";

import { Counted, sinceLabel } from "utils/laundry";

type HamperCardProps = {
  // What's in the hamper, oldest first
  pieces: Counted[];
  onOpen: () => void;
  today?: string;
};

// The way into the hamper: a card like Today's Up next, only while there's
// something to wash
const HamperCard = ({ pieces, onOpen, today }: HamperCardProps) => {
  if (!pieces.length) return null;
  const count = pieces.length;

  return (
    <Flex
      as="button"
      onClick={onOpen}
      sx={{
        w: "100%",
        mb: 3,
        p: 2,
        pr: 3,
        gap: 3,
        alignItems: "center",
        textAlign: "left",
        borderRadius: "card",
        backgroundColor: "card",
        transition: "transform 0.1s",
        _active: { transform: "scale(0.98)" },
      }}
    >
      <Flex
        sx={{
          w: 12,
          h: 12,
          flexShrink: 0,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "thumb",
          backgroundColor: "surface",
          fontSize: "2xl",
        }}
      >
        🧺
      </Flex>
      <Box sx={{ flex: 1, minW: 0 }}>
        <Text
          noOfLines={1}
          sx={{ fontFamily: "heading", fontSize: "lg", lineHeight: 1.3 }}
        >
          {count} piece{count === 1 ? "" : "s"} in the hamper
        </Text>
        <Text noOfLines={1} sx={{ fontSize: "sm", color: "muted" }}>
          Oldest since {sinceLabel(pieces[0].lastWornOn, today)} · tap to wash
        </Text>
      </Box>
      <Icon as={MdChevronRight} sx={{ w: 5, h: 5, color: "muted" }} />
    </Flex>
  );
};

export default HamperCard;
