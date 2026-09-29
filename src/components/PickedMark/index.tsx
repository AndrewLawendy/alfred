import { Flex, Icon } from "@chakra-ui/react";
import { MdCheck } from "react-icons/md";

// The ring and tick on a chosen photo (outfit editor, jacket sheet)
export const pickedRing = {
  outline: "2px solid",
  outlineColor: "brand.500",
  outlineOffset: "2px",
} as const;

const PickedMark = () => (
  <Flex
    aria-hidden
    sx={{
      position: "absolute",
      top: 2,
      right: 2,
      w: 7,
      h: 7,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "full",
      backgroundColor: "brand.500",
      color: "card",
    }}
  >
    <Icon as={MdCheck} sx={{ w: 4, h: 4 }} />
  </Flex>
);

export default PickedMark;
