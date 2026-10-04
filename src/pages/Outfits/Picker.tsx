import { Box, Flex, Grid, Icon, Image, Text } from "@chakra-ui/react";
import { MdAdd, MdCheck } from "react-icons/md";

import PickedMark, { pickedRing } from "components/PickedMark";
import { openNewItem } from "utils/history";
import { categoryOf, CATEGORIES, MAX_PIECES, togglePick } from "utils/wardrobe";
import { Category, Item } from "utils/types";

type PickerProps = {
  items: Item[];
  picks: string[];
  active: Category;
  onTab: (category: Category) => void;
  onPick: (id: string) => void;
};

const tabs = CATEGORIES.filter(({ inOutfit }) => inOutfit);

// The editor's wardrobe: a tab per category, that category's pieces below.
// The first tile adds a new piece, so a small wardrobe has no dead end.
const Picker = ({ items, picks, active, onTab, onPick }: PickerProps) => {
  const typeOf = (id: string) => items.find((item) => item.id === id)?.type;
  const choices = items.filter(({ type }) => categoryOf(type) === active);
  const isPicked = (category: Category) =>
    picks.some((id) => categoryOf(typeOf(id) ?? "") === category);
  const isFull = picks.length >= MAX_PIECES;
  const { label, multi } = CATEGORIES.find(({ key }) => key === active)!;
  const hint = isFull
    ? "Up to 6 pieces"
    : multi
      ? "Pick as many as you like."
      : active === "shoes"
        ? "One pair of shoes per outfit. Tap another pair to swap it in."
        : `One ${label.toLowerCase()} per outfit. Tap another to swap it in.`;

  return (
    <Box>
      <Flex
        role="tablist"
        aria-label="Categories"
        sx={{
          gap: 2,
          px: 4,
          overflowX: "auto",
          scrollbarWidth: "none",
          "::-webkit-scrollbar": { display: "none" },
        }}
      >
        {tabs.map(({ key, plural }) => {
          const isActive = key === active;
          const count = items.filter(
            ({ type }) => categoryOf(type) === key
          ).length;
          return (
            <Flex
              key={key}
              as="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTab(key)}
              sx={{
                flexShrink: 0,
                alignItems: "center",
                gap: 1.5,
                h: 9,
                px: 3.5,
                borderRadius: "full",
                fontWeight: "medium",
                backgroundColor: isActive ? "ink" : "surface",
                color: isActive ? "card" : "inherit",
              }}
            >
              {plural}
              {isPicked(key) ? (
                <Icon as={MdCheck} aria-label="picked" />
              ) : (
                <Text as="span" sx={{ fontSize: "xs", opacity: 0.7 }}>
                  {count}
                </Text>
              )}
            </Flex>
          );
        })}
      </Flex>
      <Text sx={{ px: 4, pt: 2.5, fontSize: "sm", color: "muted" }}>
        {hint}
      </Text>
      <Grid
        role="tabpanel"
        templateColumns="repeat(3, minmax(0, 1fr))"
        gap={2}
        sx={{ px: 4, pt: 3, pb: 2 }}
      >
        <Flex
          as="button"
          onClick={() => openNewItem(active)}
          sx={{
            aspectRatio: "4 / 5",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            border: "1.5px dashed",
            borderColor: "line",
            borderRadius: "thumb",
            color: "muted",
            fontSize: "sm",
          }}
        >
          <Icon as={MdAdd} sx={{ w: 6, h: 6 }} />
          New piece
        </Flex>
        {choices.map((item) => {
          const isSelected = picks.includes(item.id);
          // Refused when it would add a seventh piece; swaps still work
          const isBlocked =
            !isSelected && togglePick(picks, item.id, typeOf) === picks;
          return (
            <Box
              key={item.id}
              as="button"
              onClick={() => onPick(item.id)}
              aria-label={item.title}
              aria-pressed={isSelected}
              disabled={isBlocked}
              sx={{
                minW: 0,
                textAlign: "left",
                transition: "transform 0.1s",
                _active: { transform: "scale(0.97)" },
                _disabled: { opacity: 0.4 },
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  aspectRatio: "4 / 5",
                  borderRadius: "thumb",
                  overflow: "hidden",
                  backgroundColor: "surface",
                  ...(isSelected && pickedRing),
                }}
              >
                <Image
                  src={item.imageUrl}
                  alt=""
                  sx={{ w: "100%", h: "100%", objectFit: "cover" }}
                />
                {isSelected && <PickedMark />}
              </Box>
              <Text noOfLines={1} sx={{ pt: 1, fontSize: "sm" }}>
                {item.title}
              </Text>
            </Box>
          );
        })}
      </Grid>
    </Box>
  );
};

export default Picker;
