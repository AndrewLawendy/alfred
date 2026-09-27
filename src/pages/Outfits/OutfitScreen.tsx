import { useEffect, useRef, useState, RefObject } from "react";
import { doc, orderBy } from "firebase/firestore";
import {
  Badge,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Grid,
  Heading,
  Icon,
  IconButton,
  Image,
  Text,
} from "@chakra-ui/react";
import { IconType } from "react-icons";
import { MdAdd, MdArrowBack, MdCheckCircle } from "react-icons/md";
import { GiShirt, GiBelt, GiTrousers, GiRunningShoe } from "react-icons/gi";

import Confirm from "components/Confirm";
import Loading from "components/Loading";
import Swipeable from "components/Swipeable";

import useBackToClose from "hooks/useBackToClose";
import useAddDocument from "resources/useAddDocument";
import useData from "resources/useData";
import useDeleteDocument from "resources/useDeleteDocument";
import useUpdateDocument from "resources/useUpdateDocument";
import { db } from "utils/firebase";
import {
  closeOutfit,
  openItem,
  openNewItem,
  useOutfitRoute,
} from "utils/history";
import { afterDelete, nextOrder } from "utils/rotation";
import { Item, Outfit } from "utils/types";

const slots = [
  { key: "shirt", label: "Shirt", icon: GiShirt },
  { key: "belt", label: "Belt", icon: GiBelt },
  { key: "pants", label: "Pants", icon: GiTrousers },
  { key: "shoes", label: "Shoes", icon: GiRunningShoe },
] as const;

type SlotKey = typeof slots[number]["key"];
type Picks = Partial<Record<SlotKey, string>>;

const picksOf = (outfit?: Outfit): Picks =>
  outfit
    ? Object.fromEntries(slots.map(({ key }) => [key, outfit[key]?.id]))
    : {};

// One piece of the outfit: its photo, opening the item
const Slot = ({
  label,
  icon,
  item,
}: {
  label: string;
  icon: IconType;
  item?: Item;
}) => (
  <Box
    as="button"
    onClick={() => item && openItem(item.id)}
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
        borderRadius: "xl",
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
        color: "gray.400",
        backgroundColor: "surface",
      }}
    >
      {item ? (
        <Image
          src={item.imageUrl}
          alt={item.title}
          sx={{ w: "100%", h: "100%", objectFit: "cover" }}
        />
      ) : (
        <Icon as={icon} sx={{ w: 10, h: 10 }} />
      )}
    </Flex>
    <Text sx={labelStyle}>{label}</Text>
    <Text noOfLines={1} sx={{ fontWeight: "medium", minH: 6 }}>
      {item?.title || "Missing"}
    </Text>
  </Box>
);

const labelStyle = {
  pt: 2,
  fontSize: "xs",
  fontWeight: "semibold",
  textTransform: "uppercase",
  letterSpacing: "wider",
  color: "gray.600",
} as const;

const tileStyle = {
  flexShrink: 0,
  w: "6.5rem",
  aspectRatio: "4 / 5",
  borderRadius: "xl",
  overflow: "hidden",
  scrollSnapAlign: "start",
} as const;

// Every item of one category in a row you swipe through; tap one to pick it
const Carousel = ({
  slot,
  items,
  selectedId,
  onPick,
}: {
  slot: typeof slots[number];
  items: Item[];
  selectedId?: string;
  onPick: (id: string) => void;
}) => {
  const choices = items.filter(({ type }) => type === slot.key);
  const selected = choices.find(({ id }) => id === selectedId);
  const rowRef = useRef<HTMLDivElement>(null);

  // Start with the current pick in view
  useEffect(() => {
    // Scroll only the row: scrollIntoView would also scroll the screen
    const row = rowRef.current;
    const tile = row?.querySelector<HTMLElement>("[aria-pressed=true]");
    if (row && tile) {
      row.scrollLeft =
        tile.offsetLeft - (row.clientWidth - tile.clientWidth) / 2;
    }
  }, []);

  return (
    <Box as="section" aria-label={slot.label} sx={{ mb: 5 }}>
      <Flex sx={{ alignItems: "baseline", gap: 2, px: 4, mb: 2 }}>
        <Text sx={{ ...labelStyle, pt: 0 }}>{slot.label}</Text>
        <Text noOfLines={1} sx={{ fontSize: "sm", color: "gray.600" }}>
          {selected?.title}
        </Text>
      </Flex>
      <Flex
        ref={rowRef}
        sx={{
          // The offsetParent for centring the current pick
          position: "relative",
          gap: 2.5,
          px: 4,
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
              aria-label={item.title}
              sx={{
                ...tileStyle,
                position: "relative",
                // Chakra turns outline "none" into a 2px transparent one,
                // so only colour it when selected
                ...(isSelected && {
                  outline: "3px solid",
                  outlineColor: "accent.600",
                  outlineOffset: "-3px",
                }),
                opacity: selectedId && !isSelected ? 0.7 : 1,
                transition: "opacity 0.15s, transform 0.1s",
                _active: { transform: "scale(0.97)" },
              }}
            >
              <Image
                src={item.imageUrl}
                alt=""
                sx={{ w: "100%", h: "100%", objectFit: "cover" }}
              />
              {isSelected && (
                <Icon
                  as={MdCheckCircle}
                  sx={{
                    position: "absolute",
                    top: 1.5,
                    right: 1.5,
                    w: 6,
                    h: 6,
                    color: "accent.600",
                    backgroundColor: "white",
                    borderRadius: "full",
                  }}
                />
              )}
            </Box>
          );
        })}
        <Flex
          as="button"
          onClick={() => openNewItem(slot.key)}
          sx={{
            ...tileStyle,
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            border: "1.5px dashed",
            borderColor: "gray.300",
            color: "gray.600",
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
  const [picks, setPicks] = useState<Picks>(() => picksOf(outfit));
  const [addOutfit, isAdding] = useAddDocument<Outfit>("outfits");
  const [updateOutfit, isUpdating] = useUpdateDocument<Outfit>("outfits");
  const [deleteOutfit, isDeleting] = useDeleteDocument("outfits");
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
  };

  const onDelete = async () => {
    if (!outfit) return;
    const updates = afterDelete(outfits, outfit.id);
    await deleteOutfit(outfit.id);
    await Promise.all(
      updates.map(({ id, changes }) => updateOutfit(id, changes))
    );
    closeOutfit();
  };

  const heading = !outfit
    ? "New outfit"
    : isEditing
    ? "Edit outfit"
    : `Outfit #${number}`;

  return (
    <>
      <DrawerHeader
        sx={{
          boxShadow: "material",
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
        {outfit?.active && !isEditing && (
          <Badge colorScheme="accent">Today</Badge>
        )}
        {!isEditing && (
          <Button
            onClick={() => setMode("edit")}
            variant="outline"
            size="sm"
            sx={{ borderRadius: "full", px: 4 }}
          >
            Edit
          </Button>
        )}
      </DrawerHeader>

      <DrawerBody sx={{ py: 5, ...(isEditing && { px: 0 }) }}>
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
          <Grid templateColumns="repeat(2, 1fr)" columnGap={3} rowGap={4}>
            {slots.map((slot) => (
              <Slot
                key={slot.key}
                label={slot.label}
                icon={slot.icon}
                item={itemById(picks[slot.key])}
              />
            ))}
          </Grid>
        )}

        {isEditingExisting && outfit && (
          <Flex sx={{ justifyContent: "center", mt: 4 }}>
            <Confirm
              message={
                <>
                  <Heading size="md">Delete Outfit #{number}?</Heading>
                  <Text sx={{ mt: 1, color: "gray.600" }}>
                    Its clothes stay in your wardrobe.
                  </Text>
                  {outfit.active && (
                    <Text sx={{ mt: 2, color: "red.600" }}>
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
      </DrawerBody>

      {isEditing && (
        <DrawerFooter
          sx={{
            borderTop: "1px solid",
            borderColor: "gray.100",
            pb: "calc(var(--chakra-space-4) + env(safe-area-inset-bottom))",
            flexDirection: "column",
          }}
        >
          {missing.length > 0 && (
            <Text sx={{ mb: 3, fontSize: "sm", color: "gray.600" }}>
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
        </DrawerFooter>
      )}
    </>
  );
};

// Loads outfits and wardrobe items before handing over to the editor
const OutfitPanel = ({
  param,
  headingRef,
}: {
  param: string;
  headingRef: RefObject<HTMLParagraphElement>;
}) => {
  const [outfits] = useData<Outfit>("outfits", orderBy("order"));
  const [items] = useData<Item>("wardrobe-items");

  if (!outfits || !items) {
    return (
      <DrawerBody sx={{ pt: 16 }}>
        <Loading message="Loading your outfit" columns={2} />
      </DrawerBody>
    );
  }

  const index = outfits.findIndex(({ id }) => id === param);
  if (param !== "new" && index === -1) {
    return (
      <DrawerBody sx={{ pt: 16, textAlign: "center", color: "gray.600" }}>
        This outfit no longer exists.
      </DrawerBody>
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

// One outfit screen for the whole app, opened on top of whichever page you're on
const OutfitScreen = () => {
  const param = useOutfitRoute();
  // Keep showing the last outfit while the screen slides away
  const [shown, setShown] = useState(param);
  const headingRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (param) setShown(param);
  }, [param]);

  return (
    <Drawer
      isOpen={Boolean(param)}
      onClose={closeOutfit}
      placement="right"
      size="full"
      initialFocusRef={headingRef}
    >
      <DrawerOverlay />
      <DrawerContent bg="transparent" boxShadow="none">
        <Swipeable direction="right" onClose={closeOutfit}>
          {shown && (
            <OutfitPanel key={shown} param={shown} headingRef={headingRef} />
          )}
        </Swipeable>
      </DrawerContent>
    </Drawer>
  );
};

export default OutfitScreen;
