import { useEffect, useRef, useState, RefObject } from "react";
import { doc, orderBy } from "firebase/firestore";
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Icon,
  IconButton,
  Image,
  Text,
} from "@chakra-ui/react";
import { IconType } from "react-icons";
import { MdAdd, MdArrowBack } from "react-icons/md";
import { GiShirt, GiBelt, GiTrousers, GiRunningShoe } from "react-icons/gi";

import Confirm from "components/Confirm";
import Loading from "components/Loading";
import {
  ScreenBody,
  ScreenFooter,
  ScreenHeader,
  useScreen,
} from "components/Screen";
import PickedMark, { pickedRing } from "components/PickedMark";

import useBackToClose from "hooks/useBackToClose";
import useNotice from "hooks/useNotice";
import useAddDocument from "resources/useAddDocument";
import useData from "resources/useData";
import useUpdateDocument from "resources/useUpdateDocument";
import useUpdateOutfits from "resources/useUpdateOutfits";
import { db } from "utils/firebase";
import { openNewItem } from "utils/history";
import { openItemFromPhoto } from "utils/photoTransition";
import { afterDelete, nextOrder } from "utils/rotation";
import { Item, Outfit } from "utils/types";

const slots = [
  { key: "shirt", label: "Shirt", icon: GiShirt },
  { key: "belt", label: "Belt", icon: GiBelt },
  { key: "pants", label: "Pants", icon: GiTrousers },
  { key: "shoes", label: "Shoes", icon: GiRunningShoe },
] as const;

type SlotKey = (typeof slots)[number]["key"];
type Picks = Partial<Record<SlotKey, string>>;

const picksOf = (outfit?: Outfit): Picks =>
  outfit
    ? Object.fromEntries(slots.map(({ key }) => [key, outfit[key]?.id]))
    : {};

const labelStyle = {
  fontSize: "xs",
  fontWeight: "semibold",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: "muted",
} as const;

// One piece of the outfit: its photo, opening the item. A deleted piece is a
// gap that opens the editor to pick another.
const Slot = ({
  label,
  icon,
  item,
  onMissing,
}: {
  label: string;
  icon: IconType;
  item?: Item;
  onMissing: () => void;
}) => (
  <Box
    as="button"
    onClick={(event: React.MouseEvent<HTMLElement>) =>
      item
        ? openItemFromPhoto(item.id, event.currentTarget.querySelector("img"))
        : onMissing()
    }
    sx={{
      textAlign: "left",
      minW: 0,
      transition: "transform 0.1s",
      _active: { transform: "scale(0.97)" },
    }}
  >
    <Flex
      sx={{
        aspectRatio: "4 / 5",
        borderRadius: "card",
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
        color: "gray.400",
        backgroundColor: "surface",
        ...(!item && { border: "1.5px dashed", borderColor: "line" }),
      }}
    >
      {item ? (
        <Image
          src={item.imageUrl}
          alt={item.title}
          data-photo-source={item.id}
          sx={{ w: "100%", h: "100%", objectFit: "cover" }}
        />
      ) : (
        <Icon as={icon} sx={{ w: 10, h: 10 }} />
      )}
    </Flex>
    <Text sx={{ ...labelStyle, pt: 3 }}>{label}</Text>
    <Text
      noOfLines={1}
      sx={{ fontFamily: "heading", fontSize: "lg", lineHeight: 1.3, minH: 6 }}
    >
      {item?.title ||
        `Pick ${
          label === "Pants" || label === "Shoes" ? "" : "a "
        }${label.toLowerCase()}`}
    </Text>
  </Box>
);

const tileWidth = "8rem";

// Every item of one category in a row you swipe through; tap one to pick it
const Carousel = ({
  slot,
  items,
  selectedId,
  onPick,
}: {
  slot: (typeof slots)[number];
  items: Item[];
  selectedId?: string;
  onPick: (id: string) => void;
}) => {
  const choices = items.filter(({ type }) => type === slot.key);
  const rowRef = useRef<HTMLDivElement>(null);

  // Start with the current pick in view
  useEffect(() => {
    // Scroll only the row: scrollIntoView would also scroll the screen
    const row = rowRef.current;
    const tile = row?.querySelector<HTMLElement>("[aria-pressed=true]");
    // Only when it's out of view, lining it up with the row's left padding
    if (row && tile && tile.offsetLeft + tile.offsetWidth > row.clientWidth) {
      row.scrollLeft = tile.offsetLeft - 16;
    }
  }, []);

  return (
    <Box as="section" aria-label={slot.label} sx={{ mb: 6 }}>
      <Heading as="h3" sx={{ fontSize: "xl", px: 4, mb: 2 }}>
        {slot.label}
      </Heading>
      <Flex
        ref={rowRef}
        sx={{
          // The offsetParent for centring the current pick
          position: "relative",
          gap: 3,
          px: 4,
          // Room for the chosen tile's ring, which the scroll area would clip
          py: 1,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          scrollPaddingInline: 4,
          scrollbarWidth: "none",
          "::-webkit-scrollbar": { display: "none" },
        }}
      >
        {choices.map((item) => {
          const isSelected = item.id === selectedId;
          return (
            <Box
              key={item.id}
              as="button"
              onClick={() => onPick(item.id)}
              aria-pressed={isSelected}
              sx={{
                flexShrink: 0,
                w: tileWidth,
                textAlign: "left",
                scrollSnapAlign: "start",
                transition: "transform 0.1s",
                _active: { transform: "scale(0.97)" },
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  aspectRatio: "4 / 5",
                  borderRadius: "card",
                  overflow: "hidden",
                  backgroundColor: "surface",
                  // Chakra turns outline "none" into a 2px transparent one,
                  // so only add it when selected
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
              <Text noOfLines={1} sx={{ pt: 2, fontWeight: "medium" }}>
                {item.title}
              </Text>
            </Box>
          );
        })}
        <Flex
          as="button"
          onClick={() => openNewItem(slot.key)}
          sx={{
            flexShrink: 0,
            w: tileWidth,
            aspectRatio: "4 / 5",
            scrollSnapAlign: "start",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            border: "1.5px dashed",
            borderColor: "line",
            borderRadius: "card",
            color: "muted",
            fontSize: "sm",
          }}
        >
          <Icon as={MdAdd} sx={{ w: 7, h: 7 }} />
          Add {slot.label.toLowerCase()}
        </Flex>
      </Flex>
    </Box>
  );
};

type EditorProps = {
  outfit?: Outfit;
  number: number;
  outfits: Outfit[];
  items: Item[];
  headingRef: RefObject<HTMLParagraphElement>;
};

const OutfitEditor = ({
  outfit,
  number,
  outfits,
  items,
  headingRef,
}: EditorProps) => {
  const [mode, setMode] = useState<"view" | "edit">(outfit ? "view" : "edit");
  const { close: closeOutfit } = useScreen();
  const [picks, setPicks] = useState<Picks>(() => picksOf(outfit));
  const [addOutfit, isAdding] = useAddDocument<Outfit>("outfits");
  const [updateOutfit, isUpdating] = useUpdateDocument<Outfit>("outfits");
  const [updateOutfits, isDeleting] = useUpdateOutfits();
  const toast = useNotice();
  const isLoading = isAdding || isUpdating || isDeleting;

  const isEditing = mode === "edit";
  const isEditingExisting = isEditing && outfit !== undefined;
  const itemById = (id?: string) => items.find((item) => item.id === id);
  const missing = slots.filter(({ key }) => !itemById(picks[key]));

  // Editing is its own step: Back returns to the outfit and drops changes
  useBackToClose(isEditingExisting, () => {
    setPicks(picksOf(outfit));
    setMode("view");
  });

  const onSave = async () => {
    const references = Object.fromEntries(
      slots.map(({ key }) => [
        key,
        doc(db, "wardrobe-items", picks[key] as string),
      ])
    ) as Pick<Outfit, SlotKey>;

    try {
      if (outfit) {
        await updateOutfit(outfit.id, references);
        setMode("view");
      } else {
        await addOutfit({
          ...references,
          order: nextOrder(outfits),
          // The first outfit becomes today's
          active: outfits.length === 0,
        });
        closeOutfit();
      }
    } catch {
      toast({
        status: "error",
        title: "Couldn't save the outfit",
        description: "Nothing was changed. Please try again.",
      });
    }
  };

  // The screen closes first, then the outfit goes, with the rest renumbered in
  // the same write
  const onDelete = () => {
    if (!outfit) return;
    closeOutfit();
    updateOutfits(afterDelete(outfits, outfit.id), outfit.id).catch(() =>
      toast({
        status: "error",
        title: "Couldn't delete the outfit",
        description: "It's still in your rotation. Please try again.",
      })
    );
  };

  const heading = !outfit
    ? "New outfit"
    : isEditing
      ? `Edit No. ${number}`
      : `Outfit No. ${number}`;

  return (
    <>
      <ScreenHeader
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          px: 2,
        }}
      >
        <IconButton
          variant="ghost"
          // In edit mode the arrow steps back to the outfit, like Back does
          onClick={() =>
            isEditingExisting ? window.history.back() : closeOutfit()
          }
          aria-label="Back"
          icon={<Icon as={MdArrowBack} sx={{ w: 6, h: 6 }} />}
        />
        <Text
          ref={headingRef}
          tabIndex={-1}
          sx={{ flexGrow: 1, _focus: { outline: "none" } }}
        >
          {heading}
        </Text>
        {!isEditing && (
          <Button onClick={() => setMode("edit")} variant="outline">
            Edit
          </Button>
        )}
      </ScreenHeader>

      <ScreenBody sx={{ pt: 2, pb: 5, ...(isEditing && { px: 0 }) }}>
        {isEditing && (
          <Text sx={{ px: 4, mb: 5, color: "muted" }}>
            Choose one of each. Jackets are picked on the day, based on the
            weather.
          </Text>
        )}
        {!isEditing && outfit?.active && (
          <Text
            sx={{
              display: "inline-block",
              mb: 4,
              px: 3,
              py: 1,
              borderRadius: "full",
              backgroundColor: "accentFill",
              color: "card",
              fontSize: "xs",
              fontWeight: "semibold",
              letterSpacing: "0.12em",
            }}
          >
            TODAY&apos;S OUTFIT
          </Text>
        )}
        {isEditing ? (
          slots.map((slot) => (
            <Carousel
              key={slot.key}
              slot={slot}
              items={items}
              selectedId={picks[slot.key]}
              onPick={(id) => setPicks({ ...picks, [slot.key]: id })}
            />
          ))
        ) : (
          <Grid templateColumns="repeat(2, 1fr)" columnGap={3} rowGap={5}>
            {slots.map((slot) => (
              <Slot
                key={slot.key}
                label={slot.label}
                icon={slot.icon}
                item={itemById(picks[slot.key])}
                onMissing={() => setMode("edit")}
              />
            ))}
          </Grid>
        )}

        {isEditingExisting && outfit && (
          <Flex sx={{ justifyContent: "center", mt: 4 }}>
            <Confirm
              message={
                <>
                  <Heading sx={{ fontSize: "2xl" }}>
                    Delete Outfit No. {number}?
                  </Heading>
                  <Text sx={{ mt: 2, color: "muted" }}>
                    It leaves the rotation. Its clothes stay in your wardrobe.
                  </Text>
                  {outfit.active && (
                    <Text sx={{ mt: 2, color: "dangerText" }}>
                      It&apos;s today&apos;s outfit, so the next one in the
                      rotation takes its place.
                    </Text>
                  )}
                </>
              }
              onConfirm={onDelete}
              okText="Delete"
              okType="red"
            >
              {({ onOpen }) => (
                <Button
                  onClick={onOpen}
                  isDisabled={isLoading}
                  variant="ghost"
                  colorScheme="red"
                >
                  Delete outfit
                </Button>
              )}
            </Confirm>
          </Flex>
        )}
      </ScreenBody>

      {isEditing && (
        <ScreenFooter
          sx={{
            borderTop: "1px solid",
            borderColor: "line",
            pb: "calc(var(--chakra-space-4) + env(safe-area-inset-bottom))",
            flexDirection: "column",
          }}
        >
          {missing.length > 0 && (
            <Text sx={{ mb: 3, fontSize: "sm", color: "muted" }}>
              Still missing:{" "}
              {missing.map(({ label }) => label.toLowerCase()).join(", ")}
            </Text>
          )}
          <Button
            onClick={onSave}
            isLoading={isLoading}
            isDisabled={missing.length > 0}
            colorScheme="brand"
            size="lg"
            sx={{ w: "100%", borderRadius: "full" }}
          >
            {outfit ? "Save changes" : "Add to rotation"}
          </Button>
        </ScreenFooter>
      )}
    </>
  );
};

// Loads outfits and wardrobe items before handing over to the editor
export const OutfitPanel = ({
  param,
  headingRef,
}: {
  param: string;
  headingRef: RefObject<HTMLParagraphElement>;
}) => {
  const [outfits] = useData<Outfit>("outfits", orderBy("order"));
  const [items] = useData<Item>("wardrobe-items");
  const index = outfits?.findIndex(({ id }) => id === param) ?? -1;
  const found =
    outfits && index !== -1
      ? { outfit: outfits[index], number: index + 1 }
      : undefined;
  // The last time this outfit was found, so a screen closing on its own
  // delete keeps showing it as it slides away
  const [lastSeen, setLastSeen] = useState(found);
  if (
    found &&
    (found.outfit !== lastSeen?.outfit || found.number !== lastSeen.number)
  ) {
    setLastSeen(found);
  }

  if (!outfits || !items) {
    return (
      <ScreenBody sx={{ pt: 16 }}>
        <Loading message="Loading your outfit" columns={2} />
      </ScreenBody>
    );
  }

  if (param !== "new" && index === -1 && lastSeen) {
    return (
      <OutfitEditor
        {...lastSeen}
        outfits={outfits}
        items={items}
        headingRef={headingRef}
      />
    );
  }
  if (param !== "new" && index === -1) {
    return (
      <ScreenBody sx={{ pt: 16, textAlign: "center", color: "muted" }}>
        This outfit no longer exists.
      </ScreenBody>
    );
  }

  return (
    <OutfitEditor
      outfit={outfits[index]}
      number={index + 1}
      outfits={outfits}
      items={items}
      headingRef={headingRef}
    />
  );
};
