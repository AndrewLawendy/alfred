import { useRef } from "react";
import {
  Box,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Grid,
  Heading,
  Text,
} from "@chakra-ui/react";

import { Eyebrow } from "components/PageHeader";
import Swipeable from "components/Swipeable";
import useBackToClose from "hooks/useBackToClose";
import { byId } from "utils/laundry";
import { Item, Outfit } from "utils/types";
import { outfitTitle } from "utils/wardrobe";
import OutfitCard from "pages/Home/OutfitCard";

type ChooseSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  outfits: Outfit[];
  items: Item[];
  todayId: string;
  // Marked UP NEXT; undefined once today is picked
  upNextId?: string;
  // The clean outfits other than today's (see surpriseCandidates): what
  // Surprise me picks from; the rest are dimmed
  candidates: Outfit[];
  onChoose: (id: string) => void;
};

// Choose (or Change) today's outfit: any outfit, or one at random. Outfits
// Surprise me wouldn't pick (a piece in the hamper, or one there once today's
// outfit is counted) are dimmed but can still be picked.
const ChooseSheet = ({
  isOpen,
  onClose,
  outfits,
  items,
  todayId,
  upNextId,
  candidates,
  onChoose,
}: ChooseSheetProps) => {
  useBackToClose(isOpen, onClose);
  // Focus the title on open, so no focus ring lands on Surprise me
  const titleRef = useRef<HTMLHeadingElement>(null);
  const itemsById = byId(items);
  const isNothingClean = candidates.length === 0;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      placement="bottom"
      initialFocusRef={titleRef}
    >
      <DrawerOverlay />
      <DrawerContent bg="transparent" boxShadow="none">
        <Swipeable direction="down" onClose={onClose}>
          <DrawerHeader sx={{ pb: 2 }}>
            <Eyebrow>Choose</Eyebrow>
            <Heading
              ref={titleRef}
              tabIndex={-1}
              sx={{ fontSize: "3xl", _focus: { outline: "none" } }}
            >
              Which outfit today?
            </Heading>
          </DrawerHeader>
          <DrawerBody sx={{ pb: 6 }}>
            <Flex
              as="button"
              disabled={isNothingClean}
              onClick={() =>
                onChoose(
                  candidates[Math.floor(Math.random() * candidates.length)].id
                )
              }
              sx={{
                w: "100%",
                mb: 3,
                p: 3,
                gap: 3,
                alignItems: "center",
                textAlign: "left",
                borderRadius: "card",
                border: "1.5px dashed",
                borderColor: "accent.500",
                _disabled: { opacity: 0.45 },
              }}
            >
              <Text as="span" sx={{ fontSize: "2xl" }} aria-hidden>
                🎲
              </Text>
              <Box>
                <Text sx={{ fontFamily: "heading", fontSize: "lg" }}>
                  Surprise me
                </Text>
                <Text sx={{ fontSize: "sm", color: "muted" }}>
                  {isNothingClean
                    ? "Nothing's clean right now"
                    : "A clean outfit, picked at random"}
                </Text>
              </Box>
            </Flex>
            <Grid templateColumns="repeat(2, 1fr)" gap={2}>
              {outfits.map((outfit, index) => {
                const isToday = outfit.id === todayId;
                const isUpNext = outfit.id === upNextId;
                const title = outfitTitle(outfit, index + 1);
                // Judged like Surprise me: after today's wear in the morning
                const isDirty =
                  !isToday && !candidates.some(({ id }) => id === outfit.id);
                const state = isToday
                  ? "today's"
                  : isUpNext
                    ? "up next"
                    : isDirty
                      ? "a piece in the laundry basket"
                      : undefined;
                return (
                  <OutfitCard
                    key={outfit.id}
                    outfit={outfit}
                    title={title}
                    itemsById={itemsById}
                    isSelected={isToday}
                    isDirty={isDirty}
                    tag={isUpNext ? "UP NEXT" : undefined}
                    ariaLabel={`${title}${state ? `, ${state}` : ""}`}
                    onClick={() => onChoose(outfit.id)}
                  />
                );
              })}
            </Grid>
          </DrawerBody>
        </Swipeable>
      </DrawerContent>
    </Drawer>
  );
};

export default ChooseSheet;
