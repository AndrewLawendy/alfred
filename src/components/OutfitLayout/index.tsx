import { ReactNode } from "react";
import { Box, Grid } from "@chakra-ui/react";

import OutfitItem from "components/OutfitItem";
import { MissingPiece } from "components/OutfitReference";
import { layoutOf } from "utils/wardrobe";
import { Item } from "utils/types";

type OutfitLayoutProps = {
  pieces: Item[];
  // Pieces whose item was deleted, shown as gaps
  missing?: number;
  onMissing?: () => void;
  badge?: (item: Item) => ReactNode;
};

const GAP = 8;

// Tops, dresses, bottoms and layers share one tall row; shoes and accessories
// sit in a strip of squares under it. The tall row takes what the strip
// leaves of --outfit-height, so the outfit keeps one height whatever its
// pieces.
const OutfitLayout = ({
  pieces,
  missing = 0,
  onMissing,
  badge,
}: OutfitLayoutProps) => {
  const { main, side, small } = layoutOf(pieces);
  const hasMain = main.length + side.length > 0;
  // An outfit of only shoes and accessories fills the tall row instead
  const tall = hasMain ? [...main, ...side] : small;
  const strip = hasMain ? small : [];
  const stripCount = strip.length + missing;
  // At least four across, so a lone pair of shoes stays a small square
  const columns = Math.max(4, stripCount);
  // Capped, so a wide screen keeps small squares and a tall row
  const square = `min((100cqw - ${(columns - 1) * GAP}px) / ${columns}, 104px)`;
  const tallHeight = stripCount
    ? `max(160px, var(--outfit-height, 440px) - ${square} - ${GAP}px)`
    : "var(--outfit-height, 440px)";

  return (
    <Box sx={{ containerType: "inline-size" }}>
      <Grid
        role="group"
        aria-label="Main pieces"
        gridAutoFlow="column"
        gridAutoColumns="minmax(0, 1fr)"
        gap={`${GAP}px`}
        style={{ "--outfit-photo-height": tallHeight } as React.CSSProperties}
      >
        {tall.map((item) => (
          <OutfitItem
            key={item.id}
            id={item.id}
            type={item.type}
            title={item.title}
            imageUrl={item.imageUrl}
            badge={badge?.(item)}
            isLabelled
          />
        ))}
      </Grid>
      {stripCount > 0 && (
        <Grid
          role="group"
          aria-label="Small pieces"
          templateColumns={`repeat(${columns}, ${square})`}
          gap={`${GAP}px`}
          sx={{ mt: `${GAP}px` }}
        >
          {strip.map((item) => (
            <OutfitItem
              key={item.id}
              id={item.id}
              type={item.type}
              title={item.title}
              imageUrl={item.imageUrl}
              badge={badge?.(item)}
              aspectRatio={1}
              radius="thumb"
            />
          ))}
          {Array.from({ length: missing }, (_, index) => (
            <MissingPiece
              key={index}
              aspectRatio={1}
              radius="thumb"
              onMissing={onMissing}
            />
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default OutfitLayout;
