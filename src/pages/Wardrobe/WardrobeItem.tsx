import { useState, useEffect, useMemo, useRef } from "react";
import { where } from "firebase/firestore";
import { useRoute, useLocation } from "wouter";
import {
  Button,
  Grid,
  IconButton,
  Icon,
  Text,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  Stack,
  Progress,
  useDisclosure,
} from "@chakra-ui/react";
import { MdArrowBack, MdCheckroom } from "react-icons/md";
import omit from "lodash.omit";

import FormInput from "components/FormInput";
import PhotoInput from "components/PhotoInput";
import Loading from "components/Loading";
import EmptyState from "components/EmptyState";
import Confirm from "components/Confirm";

import useForm, { FromReturn, FormConfig } from "hooks/useForm";
import useData from "resources/useData";
import useAddDocument from "resources/useAddDocument";
import useUploadImage from "resources/useUploadImage";
import useDeleteImage from "resources/useDeleteImage";
import useUpdateDocument from "resources/useUpdateDocument";
import useDeleteDocument from "resources/useDeleteDocument";
import geFileURL from "utils/geFileURL";
import resizeImage from "utils/resizeImage";

import { Item } from "utils/types";

import ItemTile from "./ItemTile";
import ItemDetails from "./ItemDetails";
import Swipeable from "components/Swipeable";

const formBase = {
  title: { initialValue: "", isRequired: true },
  description: { initialValue: "" },
  imageUrl: { initialValue: "", isRequired: true },
};

type InitialForm = FormConfig & typeof formBase;

export interface ChildrenProps extends FromReturn<InitialForm> {
  mode: "submit" | "view";
}

interface WardrobeItemPros extends Pick<Item, "type"> {
  formData?: FormConfig;
  children?: (props: ChildrenProps) => JSX.Element;
}

const WardrobeItem = ({ type, formData, children }: WardrobeItemPros) => {
  const [mode, setMode] = useState<"submit" | "view">("view");
  // Focus the title on open, so no focus ring lands on the back button
  const headingRef = useRef<HTMLParagraphElement>(null);
  const [currentFile, setCurrentFile] = useState<File>();
  const { isOpen, onOpen, onClose: onDrawerClose } = useDisclosure();
  const [items, isItemsLoading] = useData<Item>(
    "wardrobe-items",
    where("type", "==", type)
  );
  const [, params] = useRoute("/:type/:currentItem");
  const [, navigate] = useLocation();
  const currentItem: Item | undefined = useMemo(() => {
    if (items && params?.currentItem) {
      return items.find(({ id }) => id === params.currentItem);
    }
  }, [items, params?.currentItem]);
  const [addItem, isAddItemLoading] = useAddDocument<Item>("wardrobe-items");
  const [updateItem, isUpdateItemLoading] =
    useUpdateDocument<Item>("wardrobe-items");
  const [deleteItem, isDeletingItem] = useDeleteDocument("wardrobe-items");
  const [uploadItemImage, isItemImageUploading, uploadSnapshot] =
    useUploadImage();
  const [deleteItemImage, isDeleteItemImageLoading] = useDeleteImage();

  const requiredFrom = useForm<InitialForm>({
    ...formBase,
    ...formData,
  });
  const {
    values,
    errors,
    onChange,
    onBlur,
    handleSubmit,
    setFieldValue,
    setFieldTouched,
    setFormValues,
    destroyForm,
  } = requiredFrom;

  const isView = mode === "view" && currentItem !== undefined;
  const isEdit = mode === "submit" && currentItem !== undefined;
  const isLoading =
    isAddItemLoading ||
    isItemImageUploading ||
    isDeleteItemImageLoading ||
    isDeletingItem ||
    isUpdateItemLoading;

  const heading = isView ? type : isEdit ? `Edit ${type}` : `Add ${type}`;

  const onClose = () => {
    navigate(`/${type}`);
  };

  // After editing, show the updated item rather than dropping back to the list
  const onEditSaved = () => setMode("view");

  const reset = () => {
    destroyForm();
  };

  const onSubmit = () => {
    handleSubmit().then((values) => {
      if (currentItem) {
        const isSameImage = currentItem.imageUrl === values.imageUrl;
        if (isSameImage) {
          updateItem(currentItem.id, { ...values }).then(onEditSaved);
        } else if (currentFile) {
          uploadItemImage(currentFile, currentItem.imageUrl).then(
            async (response) => {
              const imageUrl = await geFileURL(response?.metadata.name || "");
              updateItem(currentItem.id, {
                ...values,
                imageUrl,
              }).then(onEditSaved);
            }
          );
        }
      } else if (currentFile) {
        uploadItemImage(currentFile).then(async (response) => {
          const imageUrl = await geFileURL(response?.metadata.name || "");
          await addItem({
            ...values,
            type,
            imageUrl,
          });

          onClose();
        });
      }
    });
  };

  const onDelete = () => {
    deleteItemImage(currentItem?.imageUrl || "").then(() => {
      deleteItem((currentItem as Item).id).then(onClose);
    });
  };

  useEffect(() => {
    if (params?.type) {
      if (params.type === type) {
        if (params.currentItem === "new") {
          setMode("submit");
          onOpen();
        } else if (params.currentItem && currentItem) {
          setMode("view");
          setFormValues(
            omit(currentItem, ["id", "user", "createdAt", "updatedAt", "type"])
          );
          onOpen();
        }
      }
    } else {
      onDrawerClose();
      setMode("submit");
      reset();
    }
  }, [params?.currentItem, currentItem]);

  if (isItemsLoading || !items) {
    return <Loading message={`Loading your ${type}s`} />;
  }

  return (
    <>
      {items.length > 0 ? (
        <Grid templateColumns="repeat(2, 1fr)" columnGap={3} rowGap={4}>
          {items.map((item) => (
            <ItemTile
              key={item.id}
              item={item}
              onClick={() => navigate(`/${type}/${item.id}`)}
            />
          ))}
        </Grid>
      ) : (
        <EmptyState
          icon={MdCheckroom}
          title={`No ${type}s yet`}
          description={`Add your first ${type} with a photo and a title.`}
          actionLabel={`Add ${type}`}
          onAction={() => navigate(`/${type}/new`)}
        />
      )}

      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        onCloseComplete={reset}
        placement="right"
        size="full"
        initialFocusRef={headingRef}
      >
        <DrawerOverlay />
        <DrawerContent bg="transparent" boxShadow="none">
          <Swipeable direction="right" onClose={onClose}>
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
                onClick={onClose}
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

            {isView ? (
              <DrawerBody sx={{ p: 0 }}>
                <ItemDetails item={currentItem} />
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
                    />
                    <FormInput
                      label="Description (Optional)"
                      name="description"
                      value={values.description}
                      error={errors.description}
                      onChange={onChange}
                      onBlur={onBlur}
                      isReadOnly={isLoading}
                    />

                    {children?.({
                      mode,
                      ...requiredFrom,
                    })}

                    {currentItem && (
                      // Kept away from Save and Edit so it's never one stray tap away
                      <Confirm
                        message={`Are you sure you want to delete ${currentItem.title}?`}
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
          </Swipeable>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default WardrobeItem;
