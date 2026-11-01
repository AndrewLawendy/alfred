import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";

import OutfitCover from "components/OutfitCover";
import { Item, Outfit } from "utils/types";
import { pieceIdsOf } from "utils/wardrobe";

// Uses the wardrobe Home already has, rather than a listener per swatch.
// Square; `size` is its width (fills its cell in the narrow cards)
export const Swatch = ({
  item,
  size = 10,
}: {
  item?: Item;
  size?: number | string;
}) => (
  <Box
    sx={{
      w: size,
      aspectRatio: 1,
      borderRadius: "thumb",
      overflow: "hidden",
      backgroundColor: "surface",
    }}
  >
    {item && (
      <Image
        src={item.imageUrl}
        alt=""
        sx={{ w: "100%", h: "100%", objectFit: "cover" }}
      />
    )}
  </Box>
);

type OutfitCardProps = {
  outfit: Outfit;
  title: string;
  itemsById: Map<string, Item>;
  // Brass edge: today's in the Choose sheet, the one shown in Home's strip
  isSelected: boolean;
  // A piece in the hamper: dimmed with 🧺, still tappable
  isDirty: boolean;
  // Small caps after the title, e.g. UP NEXT
  tag?: string;
  ariaLabel: string;
  onClick: () => void;
};

// An outfit as a small card: its title, then the photo and pieces, four at
// most. The Choose sheet and Home's strip share it.
const OutfitCard = ({
  outfit,
  title,
  itemsById,
  isSelected,
  isDirty,
  tag,
  ariaLabel,
  onClick,
}: OutfitCardProps) => (
  <Box
    as="button"
    onClick={onClick}
    aria-label={ariaLabel}
    aria-pressed={isSelected}
    sx={{
      position: "relative",
      minW: 0,
      p: 2,
      textAlign: "left",
      borderRadius: "card",
      backgroundColor: "card",
      border: "1.5px solid",
      borderColor: isSelected ? "accent.500" : "transparent",
      opacity: isDirty ? 0.45 : 1,
    }}
  >
    <Flex sx={{ alignItems: "baseline", gap: 1.5, mb: 1.5 }}>
      <Text
        noOfLines={1}
        sx={{ fontFamily: "heading", fontSize: "md", minW: 0 }}
      >
        {title}
      </Text>
      {tag && (
        <Text
          sx={{
            fontSize: "2xs",
            fontWeight: "semibold",
            letterSpacing: "0.12em",
            color: "accentText",
            whiteSpace: "nowrap",
          }}
        >
          {tag}
        </Text>
      )}
      {isDirty && (
        <Text as="span" sx={{ ml: "auto" }} aria-hidden>
          🧺
        </Text>
      )}
    </Flex>
    <Grid templateColumns="repeat(4, 1fr)" gap={1}>
      {outfit.photoUrl && (
        <OutfitCover photoUrl={outfit.photoUrl} size="100%" />
      )}
      {pieceIdsOf(outfit)
        .slice(0, outfit.photoUrl ? 3 : 4)
        .map((id) => (
          <Swatch key={id} size="100%" item={itemsById.get(id)} />
        ))}
    </Grid>
  </Box>
);

export default OutfitCard;
