import { ReactNode } from "react";
import { Box, Flex } from "@chakra-ui/react";

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
const RAIL = 110;
const HEIGHT = "var(--outfit-height, 440px)";

type Cell = { item?: Item; weight: number };

// Each cell's share of a column's height, after the gaps between them
const heightOf = (cells: Cell[], cell: Cell) => {
  const total = cells.reduce((sum, { weight }) => sum + weight, 0);
  return `calc((${HEIGHT} - ${(cells.length - 1) * GAP}px) * ${cell.weight / total})`;
};

// Tops, dresses and bottoms stack in a wide column, read top to bottom; the
// layer, shoes and accessories share a narrow rail beside it, the layer at
// double height. Every outfit keeps the same height (--outfit-height).
const OutfitLayout = ({
  pieces,
  missing = 0,
  onMissing,
  badge,
}: OutfitLayoutProps) => {
  const { main, side, small } = layoutOf(pieces);
  const toCell = (item: Item): Cell => ({
    item,
    weight: item.type === "layer" ? 2 : 1,
  });
  const rail = [
    ...[...side, ...small].map(toCell),
    ...Array.from({ length: missing }, () => ({ weight: 1 })),
  ];
  // An outfit of only shoes and accessories fills the column instead
  const column = main.length ? main.map(toCell) : rail.splice(0);
  // A top and bottom alone stand side by side: stacked full width, both
  // photos would crop to wide bands
  const isRow = rail.length === 0 && column.length === 2;

  const renderCell = (cells: Cell[], isRail: boolean) =>
    cells.map((cell, index) => (
      <Box
        key={cell.item?.id ?? `missing-${index}`}
        style={
          {
            "--outfit-photo-height": isRow ? HEIGHT : heightOf(cells, cell),
          } as React.CSSProperties
        }
        sx={{ flex: 1, minW: 0 }}
      >
        {cell.item ? (
          <OutfitItem
            id={cell.item.id}
            type={cell.item.type}
            title={cell.item.title}
            imageUrl={cell.item.imageUrl}
            badge={badge?.(cell.item)}
            // Names don't fit the rail, except the layer's taller photo
            isLabelled={!isRail || cell.item.type === "layer"}
            radius={isRail ? "thumb" : "card"}
          />
        ) : (
          <MissingPiece
            radius={isRail ? "thumb" : "card"}
            onMissing={onMissing}
          />
        )}
      </Box>
    ));

  return (
    <Flex sx={{ gap: `${GAP}px` }}>
      <Flex
        role="group"
        aria-label="Main pieces"
        data-arrangement={isRow ? "row" : "column"}
        sx={{
          flex: 1,
          minW: 0,
          gap: `${GAP}px`,
          flexDirection: isRow ? "row" : "column",
        }}
      >
        {renderCell(column, false)}
      </Flex>
      {rail.length > 0 && (
        <Flex
          role="group"
          aria-label="Side pieces"
          sx={{
            w: `${RAIL}px`,
            flexShrink: 0,
            gap: `${GAP}px`,
            flexDirection: "column",
          }}
        >
          {renderCell(rail, true)}
        </Flex>
      )}
    </Flex>
  );
};

export default OutfitLayout;
