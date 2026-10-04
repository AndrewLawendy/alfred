import { useEffect, useState, RefObject } from "react";
import { deleteField, doc } from "firebase/firestore";
import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  IconButton,
  Input,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { MdArrowBack, MdGridView, MdPhotoCamera } from "react-icons/md";

import Confirm from "components/Confirm";
import Loading from "components/Loading";
import {
  ScreenBody,
  ScreenFooter,
  ScreenHeader,
  useScreen,
} from "components/Screen";
import OutfitLayout, { Slot } from "components/OutfitLayout";
import PhotoViewer from "components/PhotoViewer";

import useBackToClose from "hooks/useBackToClose";
import useNotice from "hooks/useNotice";
import useToday from "hooks/useToday";
import useAddDocument from "resources/useAddDocument";
import useOutfits from "resources/useOutfits";
import useWardrobe from "resources/useWardrobe";
import { useLimitsState } from "resources/useLimits";
import useUpdateDocument from "resources/useUpdateDocument";
import useUpdateOutfits from "resources/useUpdateOutfits";
import useDeleteImage from "resources/useDeleteImage";
import useUploadImage from "resources/useUploadImage";
import { db } from "utils/firebase";
import geFileURL from "utils/geFileURL";
import resizeImage from "utils/resizeImage";
import { deleteOutfit, saveOutfit, watchPhoto } from "utils/outfitSave";
import { activeIndex, byId, sinceLabel, wearToday } from "utils/laundry";
import { afterDelete, nextOrder } from "utils/rotation";
import {
  categoryOf,
  CATEGORIES,
  gapsFor,
  isOutfitValid,
  MAX_PIECES,
  NAME_MAX,
  outfitTitle,
  pieceIdsOf,
  togglePick,
} from "utils/wardrobe";
import { Item, Outfit } from "utils/types";
import Picker, { PickerTab } from "./Picker";
import PhotoMenu, { AddPhoto } from "./PhotoMenu";

// Still read by screen readers, but not seen (the name field shows instead)
const srOnly = {
  position: "absolute",
  w: "1px",
  h: "1px",
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
} as const;

// The board's empty places: the required top and bottom (unless there's a
// dress), then a faint place for each optional category still open
const slotsFor = (types: string[]): Slot[] => {
  const categories = types.map(categoryOf);
  const required = gapsFor(types).map((category) => ({
    category,
    isRequired: true,
  }));
  if (types.length >= MAX_PIECES) return required;
  const optional = (["layer", "shoes", "accessory"] as const)
    .filter(
      (category) =>
        CATEGORIES.find(({ key }) => key === category)?.multi ||
        !categories.includes(category)
    )
    .map((category) => ({ category, isRequired: false }));
  return [...required, ...optional];
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
  // The outfit photo, open full screen
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const { close: closeOutfit } = useScreen();
  const [addOutfit, isAdding] = useAddDocument<Outfit>("outfits");
  const [updateOutfit, isUpdating] = useUpdateDocument<Outfit>("outfits");
  const [updateOutfits, isDeleting] = useUpdateOutfits();
  const toast = useNotice();
  const isLoading = isAdding || isUpdating || isDeleting;

  const isEditing = mode === "edit";
  const isEditingExisting = isEditing && outfit !== undefined;
  const itemById = (id?: string) => items.find((item) => item.id === id);
  const typeOf = (id: string) => itemById(id)?.type;
  const savedIds = outfit ? pieceIdsOf(outfit) : [];
  const savedPieces = savedIds.flatMap((id) => itemById(id) ?? []);
  // Deleted pieces drop out when editing; their gap is filled from the board
  const savedPicks = savedPieces.map(({ id }) => id);
  const [picks, setPicks] = useState(savedPicks);
  // The draft's name, and a newly picked photo (resizing) or a removal
  const [name, setName] = useState(outfit?.name ?? "");
  const [photo, setPhoto] = useState<Promise<File>>();
  const [isPhotoRemoved, setIsPhotoRemoved] = useState(false);
  // Saving can take a while with a photo to upload
  const [isSaving, setIsSaving] = useState(false);
  const [uploadImage] = useUploadImage();
  const [deleteImage] = useDeleteImage();
  const pickedItems = picks.flatMap((id) => itemById(id) ?? []);
  const pickedTypes = pickedItems.map(({ type }) => type);
  // The picker opens on the first thing missing
  const [tab, setTab] = useState<PickerTab>(
    () => gapsFor(pickedTypes)[0] ?? "top"
  );
  // A newly picked photo's preview, until it's saved
  const [preview, setPreview] = useState<string>();
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview]
  );
  const boardPhoto = preview ?? (isPhotoRemoved ? undefined : outfit?.photoUrl);
  const onPhotoPick = (file: File) => {
    setPhoto(
      watchPhoto(resizeImage(file), () => {
        setPhoto(undefined);
        setPreview(undefined);
        toast({
          status: "error",
          title: "Couldn't read this photo",
          description: "Try another one, or take a new photo.",
        });
      })
    );
    setPreview(URL.createObjectURL(file));
    setIsPhotoRemoved(false);
  };
  const onPhotoRemove = () => {
    setPhoto(undefined);
    setPreview(undefined);
    setIsPhotoRemoved(true);
  };
  const photoMenu = useDisclosure();
  // A new outfit starts by choosing: a photo, or pieces
  const [hasStarted, setHasStarted] = useState(!!outfit);
  const isValid = isOutfitValid(picks.length, !!boardPhoto);
  const isMulti = (key: PickerTab) =>
    key !== "photo" &&
    CATEGORIES.find((category) => category.key === key)?.multi;

  const onPick = (id: string) => {
    const next = togglePick(picks, id, typeOf);
    setPicks(next);
    // A single pick done, move on to what's still missing
    const gap = gapsFor(next.flatMap((pick) => typeOf(pick) ?? []))[0];
    if (gap && !isMulti(tab) && next.length > picks.length) setTab(gap);
  };

  // Editing is its own step: Back returns to the outfit and drops changes
  useBackToClose(isEditingExisting, () => {
    setPicks(savedPicks);
    setName(outfit?.name ?? "");
    setPhoto(undefined);
    setPreview(undefined);
    setIsPhotoRemoved(false);
    setMode("view");
  });

  const onSave = async () => {
    // A new photo needs a connection; the rest saves offline and syncs
    if (photo && !navigator.onLine) {
      toast({
        id: "offline",
        status: "info",
        title: "You're offline",
        description:
          "A new photo needs a connection. Try again once you're back online.",
      });
      return;
    }
    setIsSaving(true);
    try {
      await saveOutfit(
        {
          picks,
          name,
          photo,
          photoUrl: outfit?.photoUrl,
          isPhotoRemoved,
        },
        {
          upload: async (file, path) => {
            const response = await uploadImage(file, path);
            if (!response) throw new Error("Photo upload failed");
            return geFileURL(response.metadata.name);
          },
          write: async ({ pieces, remove, ...fields }) => {
            const changes = {
              ...fields,
              pieces: pieces.map((id) => doc(db, "wardrobe-items", id)),
            };
            if (outfit) {
              await updateOutfit(outfit.id, {
                ...changes,
                // A cleared name or removed photo; a new outfit has none
                ...Object.fromEntries(
                  remove.map((key) => [key, deleteField()])
                ),
                // The old four-slot fields go once it's saved as pieces
                shirt: deleteField(),
                belt: deleteField(),
                pants: deleteField(),
                shoes: deleteField(),
              } as unknown as Partial<Outfit>);
            } else {
              await addOutfit({
                ...(changes as unknown as Partial<Outfit>),
                order: nextOrder(outfits),
                // The first outfit becomes today's
                active: outfits.length === 0,
              } as Outfit);
            }
          },
        }
      );
      // A removed photo's file goes once the outfit no longer points to it
      if (isPhotoRemoved && !photo && outfit?.photoUrl) {
        deleteImage(outfit.photoUrl).catch(() => undefined);
      }
      setPhoto(undefined);
      setPreview(undefined);
      setIsPhotoRemoved(false);
      if (outfit) setMode("view");
      else closeOutfit();
    } catch {
      toast({
        status: "error",
        title: "Couldn't save the outfit",
        description: "Nothing was changed. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // The screen closes first, then the outfit goes, with the rest renumbered in
  // the same write
  const onDelete = () => {
    if (!outfit) return;
    closeOutfit();
    deleteOutfit(outfit, {
      remove: () => updateOutfits(afterDelete(outfits, outfit.id), outfit.id),
      deletePhoto: deleteImage,
    }).catch(() =>
      toast({
        status: "error",
        title: "Couldn't delete the outfit",
        description: "It's still in your rotation. Please try again.",
      })
    );
  };

  // Counting waits for the person's own limits
  const { limits, isLoading: isLimitsLoading } = useLimitsState();
  // Wear today: bring this outfit on screen, counting nothing; today's keeps
  // its turn
  // The outfit on Today, and whether it was picked on an earlier day: then
  // Wear today asks whether it was worn, so that wear isn't lost
  const onToday = outfits[activeIndex(outfits)];
  const today = useToday();
  const isUnpickedToday = !!onToday && onToday.pickedOn !== today;

  // Wear today: bring this outfit on screen. Today's keeps its turn, and is
  // counted first only if it was worn after all.
  const onWearToday = (countCurrent: boolean) => {
    if (!outfit) return;
    const updates = wearToday({
      outfits,
      items: byId(items),
      limits,
      date: today,
      to: outfit.id,
      countCurrent,
    });
    if (!updates.outfits.length) return;
    closeOutfit();
    updateOutfits(updates.outfits, undefined, updates.items)
      .then(() =>
        toast({ status: "success", title: `Outfit No. ${number} is today's` })
      )
      .catch(() =>
        toast({
          status: "error",
          title: "Couldn't change today's outfit",
          description: "Nothing was changed. Please try again.",
        })
      );
  };

  const heading = !outfit
    ? "New outfit"
    : isEditing
      ? `Edit No. ${number}`
      : outfit.name || `Outfit No. ${number}`;

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
          sx={{
            flexGrow: 1,
            _focus: { outline: "none" },
            // While editing, the name field takes the title's place
            ...(isEditing && hasStarted && srOnly),
          }}
        >
          {heading}
        </Text>
        {isEditing && hasStarted && (
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={NAME_MAX}
            placeholder="Name it (optional)"
            aria-label="Outfit name"
            variant="unstyled"
            sx={{
              flex: 1,
              minW: 0,
              fontFamily: "heading",
              fontSize: "2xl",
              _placeholder: { color: "muted" },
            }}
          />
        )}
        {isEditing ? (
          <Button
            onClick={onSave}
            isLoading={isLoading || isSaving}
            isDisabled={!isValid}
            colorScheme="brand"
          >
            {outfit ? "Save" : "Add"}
          </Button>
        ) : (
          <Button onClick={() => setMode("edit")} variant="outline">
            Edit
          </Button>
        )}
      </ScreenHeader>

      <ScreenBody sx={{ pt: 2, pb: 5 }}>
        {(isEditing ? boardPhoto : outfit?.photoUrl) && (
          <PhotoViewer
            photoUrl={(isEditing ? boardPhoto : outfit?.photoUrl) as string}
            title={outfit ? outfitTitle(outfit, number) : "Outfit photo"}
            isOpen={isPhotoOpen}
            onClose={() => setIsPhotoOpen(false)}
          />
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
        {isEditing && !hasStarted ? (
          <Flex sx={{ flexDirection: "column", gap: 3, pt: 4 }}>
            <Text sx={{ fontFamily: "heading", fontSize: "2xl", mb: 1 }}>
              How do you want to start?
            </Text>
            {[
              {
                icon: MdPhotoCamera,
                title: "Photo of the outfit",
                text: "One photo of the whole look. Add its pieces later, or not.",
                start: "photo" as const,
              },
              {
                icon: MdGridView,
                title: "Pick pieces",
                text: "From your wardrobe, 2 to 6.",
                start: "top" as const,
              },
            ].map(({ icon, title, text, start }) => (
              <Flex
                key={title}
                as="button"
                onClick={() => {
                  setHasStarted(true);
                  setTab(start);
                }}
                sx={{
                  gap: 4,
                  p: 4,
                  alignItems: "center",
                  textAlign: "left",
                  borderRadius: "card",
                  backgroundColor: "card",
                  transition: "transform 0.1s",
                  _active: { transform: "scale(0.98)" },
                }}
              >
                <Flex
                  sx={{
                    w: 14,
                    h: 16,
                    flexShrink: 0,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "thumb",
                    backgroundColor: "surface",
                    color: "accentText",
                  }}
                >
                  <Icon as={icon} sx={{ w: 6, h: 6 }} />
                </Flex>
                <Box>
                  <Text sx={{ fontFamily: "heading", fontSize: "xl" }}>
                    {title}
                  </Text>
                  <Text sx={{ fontSize: "sm", color: "muted" }}>{text}</Text>
                </Box>
              </Flex>
            ))}
          </Flex>
        ) : isEditing ? (
          <Box
            // The board shares the screen with the picker below
            style={{ "--outfit-height": "300px" } as React.CSSProperties}
          >
            <OutfitLayout
              pieces={pickedItems}
              slots={slotsFor(pickedTypes)}
              onSlot={setTab}
              onRemove={(item) =>
                setPicks(picks.filter((id) => id !== item.id))
              }
              onPiece={(item) => setTab(categoryOf(item.type))}
              highlight={tab === "photo" || isMulti(tab) ? undefined : tab}
              photoUrl={boardPhoto}
              // On the Photo tab with none yet, its frame leads the board
              photoPlaceholder={
                tab === "photo" && !boardPhoto ? (
                  <AddPhoto onPick={onPhotoPick} />
                ) : undefined
              }
              title={name || "Outfit photo"}
              onPhoto={photoMenu.onOpen}
              photoAction={
                <PhotoMenu
                  {...photoMenu}
                  onPick={onPhotoPick}
                  onView={() => setIsPhotoOpen(true)}
                  onRemove={onPhotoRemove}
                />
              }
            />
          </Box>
        ) : (
          <>
            <OutfitLayout
              pieces={savedPieces}
              missing={savedIds.length - savedPieces.length}
              onMissing={() => setMode("edit")}
              photoUrl={outfit?.photoUrl}
              title={outfit ? outfitTitle(outfit, number) : undefined}
              isPhotoMarked
              onPhoto={() => setIsPhotoOpen(true)}
            />

            {outfit?.photoUrl && !savedIds.length && (
              <Button
                variant="link"
                onClick={() => setMode("edit")}
                sx={{ mt: 3, color: "accentText", whiteSpace: "normal" }}
              >
                Track laundry for this outfit? Add its pieces.
              </Button>
            )}
          </>
        )}

        {outfit && outfit.id !== onToday?.id && !isEditing && (
          <Confirm
            message={
              <>
                <Heading sx={{ fontSize: "2xl" }}>
                  Did you wear No. {outfits.indexOf(onToday) + 1}?
                </Heading>
                <Text sx={{ mt: 2, color: "muted" }}>
                  {onToday?.pickedOn
                    ? `You picked it on ${sinceLabel(onToday.pickedOn, today)}. `
                    : "It's the outfit on Today. "}
                  If you wore it, Alfred counts it before switching.
                </Text>
              </>
            }
            okText="Yes, count it"
            cancelText="No"
            onConfirm={() => onWearToday(true)}
            onDecline={() => onWearToday(false)}
          >
            {({ onOpen }) => (
              <Button
                size="lg"
                colorScheme="brand"
                onClick={isUnpickedToday ? onOpen : () => onWearToday(false)}
                isLoading={isLoading}
                isDisabled={isLimitsLoading}
                sx={{ w: "100%", mt: 5 }}
              >
                Wear today
              </Button>
            )}
          </Confirm>
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

      {isEditing && hasStarted && (
        // The wardrobe to pick from, a sheet under the board; its grid
        // scrolls on its own so the board stays in view
        <ScreenFooter
          sx={{
            flexDirection: "column",
            px: 0,
            pt: 2,
            borderRadius: "24px 24px 0 0",
            backgroundColor: "card",
          }}
        >
          {/* One fixed height whatever the tab, so the sheet never jumps;
              what doesn't fit scrolls inside it */}
          <Flex sx={{ h: "44dvh", flexDirection: "column" }}>
            {/* The rule, right above where you pick */}
            {(!isValid || (boardPhoto && !picks.length)) && (
              <Text sx={{ px: 4, pb: 2, fontSize: "sm", color: "muted" }}>
                {isValid
                  ? "A photo is enough. Add its pieces to track laundry."
                  : "Add a photo, or pick 2 to 6 pieces — a top and bottom, or a dress, plus anything else."}
              </Text>
            )}
            <Box sx={{ flex: 1, minH: 0, overflowY: "auto" }}>
              <Picker
                items={items}
                picks={picks}
                active={tab}
                onTab={setTab}
                onPick={onPick}
                photo={{
                  url: boardPhoto,
                  onPick: onPhotoPick,
                  onRemove: onPhotoRemove,
                }}
              />
            </Box>
          </Flex>
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
  const [outfits] = useOutfits();
  const [items] = useWardrobe();
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
