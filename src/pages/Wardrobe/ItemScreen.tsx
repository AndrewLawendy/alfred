import { useState, useEffect, useMemo, useRef, RefObject } from "react";
import { doc, orderBy } from "firebase/firestore";
import { useDocumentData } from "react-firebase-hooks/firestore";
import {
  Button,
  IconButton,
  Icon,
  Text,
  Heading,
  Stack,
  Progress,
} from "@chakra-ui/react";
import useNotice from "hooks/useNotice";
import { MdArrowBack } from "react-icons/md";

import FormInput from "components/FormInput";
import PhotoInput from "components/PhotoInput";
import Loading from "components/Loading";
import Confirm from "components/Confirm";
import {
  ScreenBody,
  ScreenFooter,
  ScreenHeader,
  useScreen,
} from "components/Screen";

import useForm, { FromReturn, FormConfig } from "hooks/useForm";
import useBackToClose from "hooks/useBackToClose";
import useAddDocument from "resources/useAddDocument";
import useUploadImage from "resources/useUploadImage";
import useDeleteImage from "resources/useDeleteImage";
import useUpdateDocument from "resources/useUpdateDocument";
import useDeleteDocument from "resources/useDeleteDocument";
import useData from "resources/useData";
import { db } from "utils/firebase";
import { useSearchParam } from "utils/history";
import { clearSharedPhoto, readSharedPhoto } from "utils/sharedPhoto";
import geFileURL from "utils/geFileURL";
import resizeImage from "utils/resizeImage";
import { Item, Outfit } from "utils/types";

import ItemDetails from "./ItemDetails";
import JacketsForm from "./JacketsForm";

type Target = { itemId: string | null; newType: Item["type"] | null };

type ItemForm = FormConfig & {
  title: FormConfig[string];
  description: FormConfig[string];
  imageUrl: FormConfig[string];
};

export interface ChildrenProps extends FromReturn<ItemForm> {
  mode: "submit" | "view";
}

const examples: Record<Item["type"], string> = {
  shirt: "e.g. White oxford",
  belt: "e.g. Brown leather",
  pants: "e.g. Navy chinos",
  shoes: "e.g. Tan loafers",
  jacket: "e.g. Grey wool overcoat",
};

const formFor = (
  type: Item["type"],
  item?: Item,
  photoUrl?: string
): ItemForm => ({
  title: {
    initialValue: item?.title || "",
    isRequired: true,
    requiredMessage: "Give it a name",
  },
  description: { initialValue: item?.description || "" },
  imageUrl: {
    initialValue: item?.imageUrl || photoUrl || "",
    isRequired: true,
    requiredMessage: "Add a photo",
  },
  ...(type === "jacket" && {
    maxTemperature: {
      initialValue:
        item?.type === "jacket" ? String(item.maxTemperature ?? "") : "",
      isRequired: true,
      requiredMessage: "Set the temperature to suggest it at",
    },
  }),
});

type EditorProps = {
  type: Item["type"];
  item?: Item;
  headingRef: RefObject<HTMLParagraphElement>;
  // A photo shared into Alfred from another app, ready to use
  sharedPhoto?: File;
};

const ItemEditor = ({ type, item, headingRef, sharedPhoto }: EditorProps) => {
  const [mode, setMode] = useState<"submit" | "view">(item ? "view" : "submit");
  // The picked photo, resized. Kept as the promise so Save can wait for it
  // instead of finding nothing to upload when tapped mid-resize.
  const photoFile = useRef<Promise<File>>();
  const [isSaving, setIsSaving] = useState(false);
  const [addItem, isAddItemLoading] = useAddDocument<Item>("wardrobe-items");
  const [updateItem, isUpdateItemLoading] =
    useUpdateDocument<Item>("wardrobe-items");
  const [deleteItem, isDeletingItem] = useDeleteDocument("wardrobe-items");
  const [uploadItemImage, isItemImageUploading, uploadSnapshot] =
    useUploadImage();
  const [deleteItemImage, isDeleteItemImageLoading] = useDeleteImage();
  // The outfits this piece is in, by their number, to warn before a delete
  const [outfits] = useData<Outfit>("outfits", orderBy("order"));
  const usedIn = (outfits || [])
    .map((outfit, index) => ({ outfit, number: index + 1 }))
    .filter(({ outfit }) =>
      (["shirt", "belt", "pants", "shoes"] as const).some(
        (slot) => item && outfit[slot]?.id === item.id
      )
    )
    .map(({ number }) => `No. ${number}`);

  // The picked photo's preview URL. One at a time: the previous one is
  // released on every new pick and when the editor closes.
  const previewUrl = useRef<string>();
  const showPhoto = (file: File) => {
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    previewUrl.current = URL.createObjectURL(file);
    return previewUrl.current;
  };
  useEffect(
    () => () => {
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    },
    []
  );
  const [sharedUrl] = useState(() => sharedPhoto && showPhoto(sharedPhoto));
  useEffect(() => {
    if (sharedPhoto) photoFile.current = resizeImage(sharedPhoto);
  }, []);
  const form = useForm<ItemForm>(formFor(type, item, sharedUrl));
  const {
    values,
    errors,
    onChange,
    onBlur,
    handleSubmit,
    setFieldValue,
    setFieldTouched,
    destroyForm,
    reInitializeForm,
    setFormValues,
  } = form;

  const isView = mode === "view" && item !== undefined;
  const isEdit = mode === "submit" && item !== undefined;
  const isLoading =
    isSaving ||
    isAddItemLoading ||
    isItemImageUploading ||
    isDeleteItemImageLoading ||
    isDeletingItem ||
    isUpdateItemLoading;

  // Editing is its own step: Back leaves edit mode and drops unsaved changes
  useBackToClose(isEdit, () => {
    destroyForm();
    setMode("view");
  });

  const heading = isView ? type : isEdit ? `Edit ${type}` : `Add ${type}`;
  // After editing, show the updated item rather than closing it
  const onEditSaved = () => setMode("view");

  // Photos live in Storage, which can't queue an upload or a delete offline
  const toast = useNotice();
  const { close: closeItem } = useScreen();
  const needsConnection = (action: string) => {
    if (navigator.onLine) return false;
    toast({
      id: "offline",
      status: "info",
      title: "You're offline",
      description: `${action} needs a connection. Try again once you're back online.`,
    });
    return true;
  };

  // Upload the photo (to `path` when replacing one) and return its URL
  const uploadPhoto = async (path?: string) => {
    const file = await photoFile.current?.catch(() => {
      throw new Error("Unreadable photo");
    });
    if (!file) throw new Error("No photo to upload");
    const response = await uploadItemImage(file, path);
    if (!response) throw new Error("Photo upload failed");
    return geFileURL(response.metadata.name);
  };

  const onSubmit = async () => {
    // Stays pending while the form is invalid; the fields show why
    const values = await handleSubmit();
    const isNewPhoto = values.imageUrl !== item?.imageUrl;
    if (isNewPhoto && needsConnection("A new photo")) return;

    // The form works in text; a jacket's temperature is stored as a number
    const fields =
      type === "jacket"
        ? { ...values, maxTemperature: Number(values.maxTemperature) }
        : values;

    setIsSaving(true);
    try {
      if (item) {
        const imageUrl = isNewPhoto
          ? await uploadPhoto(item.imageUrl)
          : item.imageUrl;
        await updateItem(item.id, { ...fields, imageUrl });
        // What was saved is the form's new starting point: Back from the next
        // edit returns to it, and the photo no longer counts as new
        const saved = { ...values, imageUrl };
        reInitializeForm(saved);
        setFormValues(saved);
        onEditSaved();
      } else {
        const imageUrl = await uploadPhoto();
        await addItem({ ...fields, type, imageUrl });
        closeItem();
      }
    } catch {
      toast({
        status: "error",
        title: `Couldn't save the ${type}`,
        description: "Nothing was changed. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const onDelete = async () => {
    if (!item || needsConnection("Deleting")) return;
    try {
      await deleteItem(item.id);
      closeItem();
      // The photo goes last: if that fails it's only an unused file, where a
      // missing photo left an item that could never be deleted
      deleteItemImage(item.imageUrl).catch(() => undefined);
    } catch {
      toast({
        status: "error",
        title: `Couldn't delete the ${type}`,
        description: "Please try again.",
      });
    }
  };

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
          // In edit mode the arrow steps back to the item, like Back does
          onClick={() => (isEdit ? window.history.back() : closeItem())}
          aria-label="Back"
          icon={<Icon as={MdArrowBack} sx={{ w: 6, h: 6 }} />}
        />
        <Text
          ref={headingRef}
          tabIndex={-1}
          sx={{
            flexGrow: 1,
            textTransform: "capitalize",
            _focus: { outline: "none" },
          }}
        >
          {heading}
        </Text>
        {isView && (
          <Button onClick={() => setMode("submit")} variant="outline">
            Edit
          </Button>
        )}
      </ScreenHeader>

      {isView && item ? (
        <ScreenBody sx={{ p: 0 }}>
          <ItemDetails item={item} />
        </ScreenBody>
      ) : (
        <>
          <ScreenBody>
            <Stack spacing={4} sx={{ py: 4 }}>
              <div>
                <PhotoInput
                  name="imageUrl"
                  imageUrl={values.imageUrl}
                  error={errors.imageUrl}
                  onChange={(file) => {
                    setFieldValue("imageUrl", showPhoto(file));
                    photoFile.current = resizeImage(file);
                  }}
                  onBlur={() => {
                    setFieldTouched("imageUrl");
                  }}
                  disabled={isLoading}
                />
                {uploadSnapshot && (
                  <Progress
                    sx={{ mt: 3 }}
                    colorScheme="brand"
                    hasStripe
                    value={
                      (uploadSnapshot.bytesTransferred /
                        uploadSnapshot.totalBytes) *
                      100
                    }
                  />
                )}
              </div>

              <FormInput
                label="Title"
                name="title"
                value={values.title}
                error={errors.title}
                onChange={onChange}
                onBlur={onBlur}
                isReadOnly={isLoading}
                isRequired
                placeholder={examples[type]}
              />
              <FormInput
                label="Description"
                isOptional
                name="description"
                value={values.description}
                error={errors.description}
                onChange={onChange}
                onBlur={onBlur}
                isReadOnly={isLoading}
                placeholder="e.g. Slim fit, goes with anything"
              />

              {type === "jacket" && <JacketsForm mode={mode} {...form} />}

              {item && (
                // Kept away from Save and Edit so it's never one stray tap away
                <Confirm
                  message={
                    <>
                      <Heading sx={{ fontSize: "2xl" }}>
                        Delete {item.title}?
                      </Heading>
                      <Text sx={{ mt: 2, color: "gray.600" }}>
                        This removes the {type} and its photo from your
                        wardrobe. You can&apos;t undo this.
                      </Text>
                      {usedIn.length > 0 && (
                        <Text sx={{ mt: 2, color: "red.600" }}>
                          {usedIn.length > 1
                            ? `Outfits ${usedIn
                                .slice(0, -1)
                                .join(", ")} and ${usedIn.slice(
                                -1
                              )} use it, and keep their place in the rotation`
                            : `Outfit ${usedIn[0]} uses it, and keeps its place in the rotation`}{" "}
                          with a gap until you pick another {type}.
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
                      sx={{ alignSelf: "center", mt: 6 }}
                    >
                      Delete {type}
                    </Button>
                  )}
                </Confirm>
              )}
            </Stack>
          </ScreenBody>

          <ScreenFooter
            sx={{
              borderTop: "1px solid",
              borderColor: "line",
              pb: "calc(var(--chakra-space-4) + env(safe-area-inset-bottom))",
            }}
          >
            <Button
              onClick={onSubmit}
              isLoading={isLoading}
              colorScheme="brand"
              size="lg"
              sx={{ w: "100%", borderRadius: "full" }}
            >
              Save
            </Button>
          </ScreenFooter>
        </>
      )}
    </>
  );
};

// Loads the item (when viewing one) before handing over to the editor
export const ItemPanel = ({
  itemId,
  newType,
  headingRef,
}: Target & { headingRef: RefObject<HTMLParagraphElement> }) => {
  const reference = useMemo(
    () => (itemId ? doc(db, "wardrobe-items", itemId) : undefined),
    [itemId]
  );
  const [data, isLoading] = useDocumentData(reference);
  // A shared photo (?shared=1) is read once, then removed from the cache;
  // null means there was none to read
  const isShared = useSearchParam("shared") === "1";
  const [sharedPhoto, setSharedPhoto] = useState<File | null>();
  useEffect(() => {
    if (!newType || !isShared) return;
    readSharedPhoto()
      .catch(() => undefined)
      .then((file) => {
        setSharedPhoto(file || null);
        clearSharedPhoto();
      });
  }, []);
  const item = data && itemId ? ({ ...data, id: itemId } as Item) : undefined;

  if (newType) {
    if (isShared && sharedPhoto === undefined) {
      return (
        <ScreenBody sx={{ pt: 16 }}>
          <Loading message="Getting your photo" columns={1} />
        </ScreenBody>
      );
    }
    return (
      <ItemEditor
        type={newType}
        headingRef={headingRef}
        sharedPhoto={sharedPhoto || undefined}
      />
    );
  }
  if (isLoading) {
    return (
      <ScreenBody sx={{ pt: 16 }}>
        <Loading message="Loading your item" columns={1} />
      </ScreenBody>
    );
  }
  if (!item) {
    return (
      <ScreenBody sx={{ pt: 16, textAlign: "center", color: "gray.600" }}>
        This item no longer exists.
      </ScreenBody>
    );
  }
  return <ItemEditor type={item.type} item={item} headingRef={headingRef} />;
};

export default ItemPanel;
