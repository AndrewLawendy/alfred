import { useState, useEffect, useMemo, useRef, RefObject } from "react";
import { doc } from "firebase/firestore";
import { useDocumentData } from "react-firebase-hooks/firestore";
import {
  Button,
  IconButton,
  Icon,
  Text,
  Heading,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  Stack,
  Progress,
} from "@chakra-ui/react";
import { MdArrowBack } from "react-icons/md";

import FormInput from "components/FormInput";
import PhotoInput from "components/PhotoInput";
import Loading from "components/Loading";
import Confirm from "components/Confirm";
import Swipeable from "components/Swipeable";

import useForm, { FromReturn, FormConfig } from "hooks/useForm";
import useBackToClose from "hooks/useBackToClose";
import useAddDocument from "resources/useAddDocument";
import useUploadImage from "resources/useUploadImage";
import useDeleteImage from "resources/useDeleteImage";
import useUpdateDocument from "resources/useUpdateDocument";
import useDeleteDocument from "resources/useDeleteDocument";
import { db } from "utils/firebase";
import { closeItem, useItemRoute } from "utils/history";
import geFileURL from "utils/geFileURL";
import resizeImage from "utils/resizeImage";
import { Item } from "utils/types";

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

const formFor = (type: Item["type"], item?: Item): ItemForm => ({
  title: {
    initialValue: item?.title || "",
    isRequired: true,
    requiredMessage: "Give it a name",
  },
  description: { initialValue: item?.description || "" },
  imageUrl: {
    initialValue: item?.imageUrl || "",
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
};

const ItemEditor = ({ type, item, headingRef }: EditorProps) => {
  const [mode, setMode] = useState<"submit" | "view">(item ? "view" : "submit");
  const [currentFile, setCurrentFile] = useState<File>();
  const [addItem, isAddItemLoading] = useAddDocument<Item>("wardrobe-items");
  const [updateItem, isUpdateItemLoading] =
    useUpdateDocument<Item>("wardrobe-items");
  const [deleteItem, isDeletingItem] = useDeleteDocument("wardrobe-items");
  const [uploadItemImage, isItemImageUploading, uploadSnapshot] =
    useUploadImage();
  const [deleteItemImage, isDeleteItemImageLoading] = useDeleteImage();

  const form = useForm<ItemForm>(formFor(type, item));
  const {
    values,
    errors,
    onChange,
    onBlur,
    handleSubmit,
    setFieldValue,
    setFieldTouched,
    destroyForm,
  } = form;

  const isView = mode === "view" && item !== undefined;
  const isEdit = mode === "submit" && item !== undefined;
  const isLoading =
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

  const onSubmit = () => {
    handleSubmit().then((values) => {
      if (item) {
        if (item.imageUrl === values.imageUrl) {
          updateItem(item.id, { ...values }).then(onEditSaved);
        } else if (currentFile) {
          uploadItemImage(currentFile, item.imageUrl).then(async (response) => {
            const imageUrl = await geFileURL(response?.metadata.name || "");
            updateItem(item.id, { ...values, imageUrl }).then(onEditSaved);
          });
        }
      } else if (currentFile) {
        uploadItemImage(currentFile).then(async (response) => {
          const imageUrl = await geFileURL(response?.metadata.name || "");
          await addItem({ ...values, type, imageUrl });
          closeItem();
        });
      }
    });
  };

  const onDelete = () => {
    if (!item) return;
    deleteItemImage(item.imageUrl).then(() => {
      deleteItem(item.id).then(closeItem);
    });
  };

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
          <Button
            onClick={() => setMode("submit")}
            variant="outline"
            size="sm"
            sx={{ borderRadius: "full", px: 4 }}
          >
            Edit
          </Button>
        )}
      </DrawerHeader>

      {isView && item ? (
        <DrawerBody sx={{ p: 0 }}>
          <ItemDetails item={item} />
        </DrawerBody>
      ) : (
        <>
          <DrawerBody>
            <Stack spacing={4} sx={{ py: 4 }}>
              <div>
                <PhotoInput
                  name="imageUrl"
                  initialImageUrl={values.imageUrl}
                  error={errors.imageUrl}
                  onChange={(file) => {
                    const imageUrl = URL.createObjectURL(file);
                    setFieldValue("imageUrl", imageUrl);
                    resizeImage(file).then(setCurrentFile);
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
                label="Description (Optional)"
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
                      <Heading size="md">Delete {item.title}?</Heading>
                      <Text sx={{ mt: 1, color: "gray.600" }}>
                        Its photo goes too. You can&apos;t undo this.
                      </Text>
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
          </DrawerBody>

          <DrawerFooter
            sx={{
              borderTop: "1px solid",
              borderColor: "gray.100",
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
          </DrawerFooter>
        </>
      )}
    </>
  );
};

// Loads the item (when viewing one) before handing over to the editor
const ItemPanel = ({
  itemId,
  newType,
  headingRef,
}: Target & { headingRef: RefObject<HTMLParagraphElement> }) => {
  const reference = useMemo(
    () => (itemId ? doc(db, "wardrobe-items", itemId) : undefined),
    [itemId]
  );
  const [data, isLoading] = useDocumentData(reference);
  const item = data && itemId ? ({ ...data, id: itemId } as Item) : undefined;

  if (newType) {
    return <ItemEditor type={newType} headingRef={headingRef} />;
  }
  if (isLoading) {
    return (
      <DrawerBody sx={{ pt: 16 }}>
        <Loading message="Loading your item" columns={1} />
      </DrawerBody>
    );
  }
  if (!item) {
    return (
      <DrawerBody sx={{ pt: 16, textAlign: "center", color: "gray.600" }}>
        This item no longer exists.
      </DrawerBody>
    );
  }
  return <ItemEditor type={item.type} item={item} headingRef={headingRef} />;
};

// One item screen for the whole app, opened on top of whichever page you're on
const ItemScreen = () => {
  const { itemId, newType } = useItemRoute();
  const isOpen = Boolean(itemId || newType);
  // Keep showing the last item while the screen slides away
  const [shown, setShown] = useState<Target>({ itemId, newType });
  const headingRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (isOpen) setShown({ itemId, newType });
  }, [itemId, newType]);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={closeItem}
      placement="right"
      size="full"
      initialFocusRef={headingRef}
    >
      <DrawerOverlay />
      <DrawerContent bg="transparent" boxShadow="none">
        <Swipeable direction="right" onClose={closeItem}>
          {(shown.itemId || shown.newType) && (
            <ItemPanel
              key={shown.itemId || shown.newType || ""}
              {...shown}
              headingRef={headingRef}
            />
          )}
        </Swipeable>
      </DrawerContent>
    </Drawer>
  );
};

export default ItemScreen;
