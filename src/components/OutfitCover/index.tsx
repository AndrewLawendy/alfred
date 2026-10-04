import { Box, Flex, Icon, Image } from "@chakra-ui/react";
import { MdPhotoCamera } from "react-icons/md";

// An outfit's photo as a small square swatch, first in a row of piece
// swatches: a thin brass ring and a camera mark tell it from the pieces
const OutfitCover = ({
  photoUrl,
  size,
}: {
  photoUrl: string;
  // A Chakra size (10) or a CSS length ("100%")
  size: number | string;
}) => (
  <Box
    sx={{
      position: "relative",
      flexShrink: 0,
      w: size,
      aspectRatio: "1",
      borderRadius: "thumb",
      boxShadow:
        "0 0 0 2px var(--chakra-colors-card), 0 0 0 3.5px var(--chakra-colors-accent-500)",
    }}
  >
    <Image
      src={photoUrl}
      alt=""
      sx={{
        position: "absolute",
        inset: 0,
        w: "100%",
        h: "100%",
        objectFit: "cover",
        borderRadius: "thumb",
        backgroundColor: "surface",
      }}
    />
    <Flex
      aria-hidden
      sx={{
        position: "absolute",
        right: -1,
        bottom: -1,
        w: 4,
        h: 4,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "full",
        backgroundColor: "card",
        color: "accentText",
      }}
    >
      <Icon as={MdPhotoCamera} sx={{ w: 2.5, h: 2.5 }} />
    </Flex>
  </Box>
);

export default OutfitCover;
