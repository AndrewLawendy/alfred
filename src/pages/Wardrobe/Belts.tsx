import { useState, useEffect } from "react";
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

import { Belt } from "utils/types";

type BeltProps = {
  modalIndex: number;
  activeModalIndex: number | undefined;
  setActiveModalIndex: (index?: number) => void;
};

const Belts = ({
  modalIndex,
  activeModalIndex,
  setActiveModalIndex,
}: BeltProps) => {
  const [mode, setMode] = useState<"submit" | "view">("view");
  const [belts, setBelts] = useState<Belt[]>([]);
  const [currentBelt, setCurrentBelt] = useState<Belt>();
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
  } = useRequiredForm({
    title: "",
    description: "",
    imageUrl: "",
  });

  const isOpen = activeModalIndex === modalIndex;
  const isView = mode === "view" && currentBelt !== undefined;
  const isEdit = mode === "submit" && currentBelt !== undefined;

  const heading = isView
    ? "View your belt"
    : isEdit
    ? "Edit your belt"
    : "Add new belt";

  const onClose = () => {
    setActiveModalIndex();
  };

  const reset = () => {
    destroyForm();
    setCurrentBelt(undefined);
  };

  const onSubmit = () => {
    handleSubmit((values) => {
      if (currentBelt) {
        const currentBeltIndex = belts.findIndex(
          ({ id }) => id === currentBelt.id
        );
        belts.splice(currentBeltIndex, 1, {
          ...currentBelt,
          ...values,
        });

        setBelts([...belts]);
      } else {
        setBelts([
          ...belts,
          {
            type: "belt",
            id: Math.random().toString(36).slice(2),
            ...values,
          },
        ]);
      }
      onClose();
    });
  };

  useEffect(() => {
    if (currentBelt) {
      setMode("view");
    } else {
      setMode("submit");
    }
  }, [currentBelt]);

  if (!belts) return null;

  return (
    <>
      <Grid templateColumns="repeat(3, 1fr)" gap={2}>
        {belts.map((belt) => (
          <OutfitItem
            key={belt.id}
            title={belt.title}
            description={belt.description}
            imageUrl={belt.imageUrl}
            onClick={() => {
              const { title, description, imageUrl } = belt;
              setFormValues({ title, description, imageUrl });
              setCurrentBelt(belt);
              setActiveModalIndex(modalIndex);
            }}
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
                onClick={onSubmit}
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
                disabled={mode === "view"}
              />

              <FormInput
                label="Title"
                name="title"
                value={values.title}
                error={errors.title}
                onChange={onChange}
                onBlur={onBlur}
                isReadOnly={mode === "view"}
              />
              <FormInput
                label="Description"
                name="description"
                value={values.description}
                error={errors.description}
                onChange={onChange}
                onBlur={onBlur}
                isReadOnly={mode === "view"}
              />
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Belts;
