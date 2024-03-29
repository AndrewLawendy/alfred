import { useState, useEffect, useMemo } from "react";
import { where } from "firebase/firestore";
import { useRoute, useLocation } from "wouter";
import {
  Grid,
  IconButton,
  Icon,
  Text,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  Stack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Progress,
  useDisclosure,
} from "@chakra-ui/react";
import { MdCheck, MdArrowBack, MdEdit, MdDeleteForever } from "react-icons/md";
import omit from "lodash.omit";

import OutfitItem from "components/OutfitItem";
import FormInput from "components/FormInput";
import PhotoInput from "components/PhotoInput";
import Loading from "components/Loading";
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

  const heading = isView
    ? `View your ${type}`
    : isEdit
    ? `Edit your ${type}`
    : `Add new ${type}`;

  const onClose = () => {
    navigate("");
  };

  const reset = () => {
    destroyForm();
  };

  const onSubmit = () => {
    handleSubmit().then((values) => {
      if (currentItem) {
        const isSameImage = currentItem.imageUrl === values.imageUrl;
        if (isSameImage) {
          updateItem(currentItem.id, { ...values }).then(onClose);
        } else if (currentFile) {
          uploadItemImage(currentFile, currentItem.imageUrl).then(
            async (response) => {
              const imageUrl = await geFileURL(response?.metadata.name || "");
              updateItem(currentItem.id, {
                ...values,
                imageUrl,
              }).then(onClose);
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
    return <Loading message={`Loading your ${type}s, please wait`} />;
  }

  return (
    <>
      {items.length > 0 ? (
        <Grid templateColumns="repeat(3, 1fr)" gap={2}>
          {items.map((item) => (
            <OutfitItem
              key={item.id}
              id={item.id}
              type={type}
              title={item.title}
              description={item.description}
              imageUrl={item.imageUrl}
              onClick={() => navigate(`/${type}/${item.id}`)}
            />
          ))}
        </Grid>
      ) : (
        <Alert
          status="warning"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
        >
          <AlertIcon boxSize="30px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            No {type}s
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            Click on Add and choose {type}s to add
          </AlertDescription>
        </Alert>
      )}

      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        onCloseComplete={reset}
        placement="right"
        size="full"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader
            sx={{
              boxShadow: "material",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <IconButton
              colorScheme="whiteAlpha"
              onClick={onClose}
              aria-label="Back to outfits"
              size="sm"
              icon={
                <Icon
                  as={MdArrowBack}
                  sx={{
                    width: 5,
                    height: 5,
                    color: "black",
                  }}
                />
              }
            />
            <Text sx={{ flexGrow: 1 }}>{heading}</Text>
            {currentItem && (
              <Confirm
                message={`Are you sure you want to delete ${currentItem.title}?`}
                onConfirm={onDelete}
                okText="Delete"
                okType="red"
              >
                {({ onOpen }) => (
                  <IconButton
                    isLoading={isLoading}
                    onClick={onOpen}
                    aria-label={`Delete ${type}`}
                    size="sm"
                    colorScheme="red"
                    icon={<Icon w={5} h={5} as={MdDeleteForever} />}
                  />
                )}
              </Confirm>
            )}

            {isView ? (
              <IconButton
                colorScheme="whiteAlpha"
                onClick={() => setMode("submit")}
                aria-label={`Edit ${type}`}
                size="sm"
                icon={
                  <Icon
                    as={MdEdit}
                    sx={{
                      width: 5,
                      height: 5,
                      color: "black",
                    }}
                  />
                }
              />
            ) : (
              <IconButton
                colorScheme="teal"
                onClick={onSubmit}
                aria-label={`Submit new ${type}`}
                size="sm"
                isLoading={isLoading}
                icon={
                  <Icon
                    as={MdCheck}
                    sx={{
                      width: 5,
                      height: 5,
                    }}
                  />
                }
              />
            )}
          </DrawerHeader>

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
                  disabled={isLoading || mode === "view"}
                />
                {uploadSnapshot && (
                  <Progress
                    sx={{ mt: 3 }}
                    colorScheme="teal"
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
                isReadOnly={isLoading || mode === "view"}
                isRequired
              />
              <FormInput
                label="Description (Optional)"
                name="description"
                value={values.description}
                error={errors.description}
                onChange={onChange}
                onBlur={onBlur}
                isReadOnly={isLoading || mode === "view"}
              />

              {children?.({
                mode,
                ...requiredFrom,
              })}
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default WardrobeItem;
