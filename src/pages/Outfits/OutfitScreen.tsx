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
  Icon,
  IconButton,
  Image,
  Text,
} from "@chakra-ui/react";
import { IconType } from "react-icons";
import { MdArrowBack, MdCheckCircle } from "react-icons/md";
import { GiShirt, GiBelt, GiTrousers, GiRunningShoe } from "react-icons/gi";

import Confirm from "components/Confirm";
import EmptyState from "components/EmptyState";
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

// One piece of the outfit: its photo, or an invitation to choose one
const Slot = ({
  label,
  icon,
  item,
  onClick,
  isEditing,
}: {
  label: string;
  icon: IconType;
  item?: Item;
  onClick: () => void;
  isEditing: boolean;
}) => (
  <Box
    as="button"
    onClick={onClick}
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
        flexDirection: "column",
        gap: 2,
        color: "gray.400",
        ...(item
          ? { backgroundColor: "gray.100" }
          : {
              border: "1.5px dashed",
              borderColor: "gray.300",
              backgroundColor: "white",
            }),
      }}
    >
      {item ? (
        <Image
          src={item.imageUrl}
          alt={item.title}
          sx={{ w: "100%", h: "100%", objectFit: "cover" }}
        />
      ) : (
        <>
          <Icon as={icon} sx={{ w: 10, h: 10 }} />
          <Text sx={{ fontSize: "sm", color: "gray.500" }}>
            Choose {label.toLowerCase()}
          </Text>
        </>
      )}
    </Flex>
    <Text
      sx={{
        pt: 2,
        fontSize: "xs",
        fontWeight: "semibold",
        textTransform: "uppercase",
        letterSpacing: "wide",
        color: "gray.500",
      }}
    >
      {label}
      {isEditing && item && " · change"}
    </Text>
    <Text noOfLines={1} sx={{ fontWeight: "semibold", minH: 6 }}>
      {item?.title}
    </Text>
  </Box>
);

// Pick one item of a category for a slot
const Picker = ({
  slot,
  items,
  selectedId,
  onPick,
  onClose,
}: {
  slot: typeof slots[number] | null;
  items: Item[];
  selectedId?: string;
  onPick: (id: string) => void;
  onClose: () => void;
}) => {
  useBackToClose(Boolean(slot), onClose);
  // Focus the title on open, so no focus ring lands on the first choice
  const titleRef = useRef<HTMLHeadingElement>(null);
  const choices = slot ? items.filter(({ type }) => type === slot.key) : [];

  return (
    <Drawer
      isOpen={Boolean(slot)}
      onClose={onClose}
      placement="bottom"
      initialFocusRef={titleRef}
    >
      <DrawerOverlay />
      <DrawerContent bg="transparent" boxShadow="none">
        <Swipeable direction="down" onClose={onClose}>
          {slot && (
            <>
              <DrawerHeader
                ref={titleRef}
                tabIndex={-1}
                sx={{ _focus: { outline: "none" } }}
              >
                Choose {slot.label.toLowerCase()}
              </DrawerHeader>
              <DrawerBody sx={{ maxH: "65dvh", pb: 6 }}>
                {choices.length ? (
                  <Grid templateColumns="repeat(3, 1fr)" gap={3}>
                    {choices.map((item) => {
                      const isSelected = item.id === selectedId;
                      return (
                        <Box
                          key={item.id}
                          as="button"
                          onClick={() => onPick(item.id)}
                          sx={{ textAlign: "left", minW: 0 }}
                        >
                          <Box
                            sx={{
                              position: "relative",
                              aspectRatio: "1",
                              borderRadius: "lg",
                              overflow: "hidden",
                              outline: isSelected ? "3px solid" : "none",
                              outlineColor: "accent.400",
                              outlineOffset: "2px",
                            }}
                          >
                            <Image
                              src={item.imageUrl}
                              alt={item.title}
                              sx={{ w: "100%", h: "100%", objectFit: "cover" }}
                            />
                            {isSelected && (
                              <Icon
                                as={MdCheckCircle}
                                sx={{
                                  position: "absolute",
                                  top: 1,
                                  right: 1,
                                  w: 6,
                                  h: 6,
                                  color: "accent.400",
                                  backgroundColor: "white",
                                  borderRadius: "full",
                                }}
                              />
                            )}
                          </Box>
                          <Text noOfLines={1} sx={{ pt: 1, fontSize: "sm" }}>
                            {item.title}
                          </Text>
                        </Box>
                      );
                    })}
                  </Grid>
                ) : (
                  <EmptyState
                    icon={slot.icon}
                    title={`No ${slot.label.toLowerCase()} yet`}
                    description="Add one to your wardrobe and it will show up here."
                    actionLabel={`Add ${slot.label.toLowerCase()}`}
                    onAction={() => openNewItem(slot.key)}
                  />
                )}
              </DrawerBody>
            </>
          )}
        </Swipeable>
      </DrawerContent>
    </Drawer>
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
  const [openSlot, setOpenSlot] = useState<typeof slots[number] | null>(null);
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

      <DrawerBody sx={{ py: 5 }}>
        <Grid templateColumns="repeat(2, 1fr)" columnGap={3} rowGap={4}>
          {slots.map((slot) => {
            const item = itemById(picks[slot.key]);
            return (
              <Slot
                key={slot.key}
                label={slot.label}
                icon={slot.icon}
                item={item}
                isEditing={isEditing}
                onClick={() =>
                  isEditing ? setOpenSlot(slot) : item && openItem(item.id)
                }
              />
            );
          })}
        </Grid>

        {isEditing && missing.length > 0 && (
          <Text sx={{ mt: 5, textAlign: "center", color: "gray.500" }}>
            Pick {missing.map(({ label }) => label.toLowerCase()).join(", ")} to
            save this outfit.
          </Text>
        )}

        {isEditingExisting && outfit && (
          <Flex sx={{ justifyContent: "center", mt: 8 }}>
            <Confirm
              message={
                <>
                  <Text>Delete this outfit?</Text>
                  {outfit.active && (
                    <Text fontSize="sm" color="red.500">
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
          }}
        >
          <Button
            onClick={onSave}
            isLoading={isLoading}
            isDisabled={missing.length > 0}
            colorScheme="brand"
            size="lg"
            sx={{ w: "100%", borderRadius: "full" }}
          >
            Save
          </Button>
        </DrawerFooter>
      )}

      <Picker
        slot={openSlot}
        items={items}
        selectedId={openSlot ? picks[openSlot.key] : undefined}
        onPick={(id) => {
          if (openSlot) setPicks({ ...picks, [openSlot.key]: id });
          setOpenSlot(null);
        }}
        onClose={() => setOpenSlot(null)}
      />
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
      <DrawerBody sx={{ pt: 16, textAlign: "center", color: "gray.500" }}>
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
