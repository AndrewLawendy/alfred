import { ReactNode } from "react";
import { Box, Flex, Icon, IconButton, Text } from "@chakra-ui/react";
import { MdAdd, MdClose } from "react-icons/md";

import OutfitItem from "components/OutfitItem";
import { MissingPiece } from "components/OutfitReference";
import PhotoLayout from "./PhotoLayout";
import { pickedRing } from "components/PickedMark";
import { frosted } from "utils/theme";
import { categoryOf, CATEGORIES, gapsFor, rank } from "utils/wardrobe";
import { Category, Item } from "utils/types";

// An empty place on the editor's board: a required one (a top and bottom,
// or a dress) is full size, an optional one is a faint rail tile
export type Slot = { category: Category; isRequired: boolean };

type OutfitLayoutProps = {
  pieces: Item[];
  // Pieces whose item was deleted, shown as gaps
  missing?: number;
  onMissing?: () => void;
  badge?: (item: Item) => ReactNode;
  // Editing: empty places, taking a piece out, and choosing a category
  slots?: Slot[];
  onSlot?: (category: Category) => void;
  onRemove?: (item: Item) => void;
  onPiece?: (item: Item) => void;
  // The category a pick will land in, outlined
  highlight?: Category;
  // The outfit's own photo: then the photo leads and the pieces wrap it
  photoUrl?: string;
  // What the outfit is called, the photo's accessible name
  title?: string;
  // Ring and mark the photo as the look (the outfit screen)
  isPhotoMarked?: boolean;
  // Tapping the outfit photo
  onPhoto?: () => void;
  // Editing: a control on the photo's corner
  photoAction?: ReactNode;
};

const GAP = 8;
const RAIL = 110;
const HEIGHT = "var(--outfit-height, 440px)";
const CORE: Category[] = ["top", "dress", "bottom"];

// lost: a deleted piece whose category the rest of the outfit tells
type Cell = { item?: Item; slot?: Slot; lost?: Category; weight: number };

const categoryOfCell = ({ item, slot, lost }: Cell) =>
  item ? categoryOf(item.type) : (slot?.category ?? lost);

const addLabel = (category: Category) => {
  const label = CATEGORIES.find(({ key }) => key === category)?.label ?? "";
  if (category === "shoes") return "Add shoes";
  return `Add ${category === "accessory" ? "an" : "a"} ${label.toLowerCase()}`;
};

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
  slots = [],
  onSlot,
  onRemove,
  onPiece,
  highlight,
  photoUrl,
  title,
  isPhotoMarked,
  onPhoto,
  photoAction,
}: OutfitLayoutProps) => {
  if (photoUrl) {
    return (
      <PhotoLayout
        photoUrl={photoUrl}
        title={title}
        pieces={pieces}
        badge={badge}
        isMarked={isPhotoMarked}
        onPhoto={onPhoto}
        photoAction={photoAction}
        onRemove={onRemove}
        onPiece={onPiece}
      />
    );
  }
  // A top with no bottom (or the reverse) and a deleted piece: that piece
  // was the bottom. Otherwise a deleted piece can't be told.
  const needed = gapsFor(pieces.map(({ type }) => type));
  const lost = needed.length && needed.length <= missing ? needed : [];
  const cells: Cell[] = [
    ...pieces.map((item) => ({ item })),
    ...slots.map((slot) => ({ slot })),
    ...lost.map((category) => ({ lost: category })),
  ]
    .map((cell) => ({
      ...cell,
      weight: categoryOfCell(cell as Cell) === "layer" ? 2 : 1,
    }))
    // Stable: within a category, the order the person picked
    .sort(
      (a, b) => rank(categoryOfCell(a) ?? "") - rank(categoryOfCell(b) ?? "")
    );
  const isCore = (cell: Cell) => CORE.includes(categoryOfCell(cell)!);
  const rail = [
    ...cells.filter((cell) => !isCore(cell)),
    ...Array.from({ length: missing - lost.length }, () => ({ weight: 1 })),
  ];
  // An outfit of only shoes and accessories fills the column instead
  const core = cells.filter(isCore);
  const column = core.length ? core : rail.splice(0);
  // A top and bottom alone stand side by side: stacked full width, both
  // photos would crop to wide bands
  const isRow = rail.length === 0 && column.length === 2;

  const renderCell = (cells: Cell[], isRail: boolean) =>
    cells.map((cell, index) => {
      const radius = isRail ? "thumb" : "card";
      const { item, slot } = cell;
      return (
        <Box
          key={item?.id ?? slot?.category ?? `missing-${cell.lost ?? index}`}
          style={
            {
              "--outfit-photo-height": isRow ? HEIGHT : heightOf(cells, cell),
            } as React.CSSProperties
          }
          sx={{
            position: "relative",
            flex: 1,
            minW: 0,
            borderRadius: radius,
            ...(highlight &&
              categoryOfCell(cell) === highlight &&
              !slot &&
              pickedRing),
          }}
        >
          {item && (
            <OutfitItem
              id={item.id}
              type={item.type}
              title={item.title}
              imageUrl={item.imageUrl}
              badge={badge?.(item)}
              // Names don't fit the rail, except the layer's taller photo
              isLabelled={!isRail || item.type === "layer"}
              radius={radius}
              {...(onPiece && {
                onClick: () => onPiece(item),
                role: "button",
                "aria-label": item.title,
              })}
            />
          )}
          {item && onRemove && (
            <IconButton
              aria-label={`Remove ${item.title}`}
              icon={<Icon as={MdClose} />}
              size="xs"
              onClick={() => onRemove(item)}
              sx={{
                ...frosted,
                position: "absolute",
                top: 2,
                right: 2,
                borderRadius: "full",
              }}
            />
          )}
          {slot && (
            <Flex
              as="button"
              onClick={() => onSlot?.(slot.category)}
              aria-label={addLabel(slot.category)}
              sx={{
                w: "100%",
                height: "var(--outfit-photo-height)",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                borderRadius: radius,
                border: slot.isRequired ? "2px dashed" : "1.5px dashed",
                borderColor: slot.isRequired ? "accentText" : "line",
                color: slot.isRequired ? "accentText" : "muted",
                fontSize: "sm",
                ...(highlight === slot.category && {
                  backgroundColor: "card",
                }),
              }}
            >
              <Icon as={MdAdd} sx={{ w: 5, h: 5 }} />
              <Text aria-hidden>
                {slot.isRequired
                  ? addLabel(slot.category)
                  : CATEGORIES.find(({ key }) => key === slot.category)?.label}
              </Text>
            </Flex>
          )}
          {!item && !slot && (
            <MissingPiece
              category={cell.lost}
              isLabelled={!isRail}
              radius={radius}
              onMissing={onMissing}
            />
          )}
        </Box>
      );
    });

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
