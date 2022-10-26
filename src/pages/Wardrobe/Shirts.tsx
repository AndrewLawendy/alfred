import { useState } from "react";
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
} from "@chakra-ui/react";
import { MdCheck, MdArrowBack, MdEdit } from "react-icons/md";

import OutfitItem from "components/OutfitItem";
import FormInput from "components/FormInput";
import PhotoInput from "components/PhotoInput";

import useRequiredForm from "hooks/useRequiredForm";

import { Shirt } from "utils/types";

type ShirtsProps = {
  modalIndex: number;
  activeModalIndex: number | undefined;
  setActiveModalIndex: (index?: number) => void;
};

const Shirts = ({
  modalIndex,
  activeModalIndex,
  setActiveModalIndex,
}: ShirtsProps) => {
  const [mode, setMode] = useState<"submit" | "view">("view");
  const [shirts, setShirts] = useState<Shirt[]>([]);
  const {
    values,
    errors,
    onChange,
    onBlur,
    handleSubmit,
    setFieldValue,
    setFieldTouched,
    destroyForm,
  } = useRequiredForm({
    title: "",
    description: "",
    imageUrl: "",
  });

  const isOpen = activeModalIndex === modalIndex;
  const currentOutfit = undefined;
  const isView = mode === "view" && currentOutfit !== undefined;
  const isEdit = mode === "submit" && currentOutfit !== undefined;
  //   const isAdd = mode === "submit" && currentOutfit === undefined;
  const heading = isView
    ? "View your shirt"
    : isEdit
    ? "Edit your shirt"
    : "Add new shirt";

  const onClose = () => {
    setActiveModalIndex();
  };

  const submit = () => {
    handleSubmit(({ title, description, imageUrl }) => {
      onClose();
      setShirts([
        ...shirts,
        {
          type: "shirt",
          title,
          description,
          imageUrl,
          id: Math.random().toString(36).slice(2),
        },
      ]);
    });
  };

  const reset = () => {
    destroyForm();
  };

  if (!shirts) return null;

  return (
    <>
      <Grid templateColumns="repeat(3, 1fr)" gap={2}>
        {shirts.map((shirt) => (
          <OutfitItem
            key={shirt.id}
            title={shirt.title}
            description={shirt.description}
            imageUrl={shirt.imageUrl}
          />
        ))}
      </Grid>

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
            {isView ? (
              <IconButton
                colorScheme="whiteAlpha"
                onClick={() => setMode("submit")}
                aria-label="Edit outfit"
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
                onClick={submit}
                aria-label="Submit New Outfit"
                size="sm"
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
              <PhotoInput
                name="imageUrl"
                initialImageUrl={values.imageUrl}
                error={errors.imageUrl}
                onChange={(file) => {
                  const imageUrl = URL.createObjectURL(file);
                  setFieldValue("imageUrl", imageUrl);
                }}
                onBlur={() => {
                  setFieldTouched("imageUrl");
                }}
              />

              <FormInput
                label="Title"
                name="title"
                value={values.title}
                error={errors.title}
                onChange={onChange}
                onBlur={onBlur}
              />
              <FormInput
                label="Description"
                name="description"
                value={values.description}
                error={errors.description}
                onChange={onChange}
                onBlur={onBlur}
              />
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Shirts;
