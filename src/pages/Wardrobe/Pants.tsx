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
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { MdCheck, MdArrowBack, MdEdit } from "react-icons/md";

import OutfitItem from "components/OutfitItem";
import FormInput from "components/FormInput";
import PhotoInput from "components/PhotoInput";

import useRequiredForm from "hooks/useRequiredForm";

import { PantsPair } from "utils/types";

type PantsProps = {
  modalIndex: number;
  activeModalIndex: number | undefined;
  setActiveModalIndex: (index?: number) => void;
};

const Pants = ({
  modalIndex,
  activeModalIndex,
  setActiveModalIndex,
}: PantsProps) => {
  const [mode, setMode] = useState<"submit" | "view">("view");
  const [pants, setPants] = useState<PantsPair[]>([]);
  const [currentPantsPair, setCurrentPantsPair] = useState<PantsPair>();
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
  const isView = mode === "view" && currentPantsPair !== undefined;
  const isEdit = mode === "submit" && currentPantsPair !== undefined;

  const heading = isView
    ? "View your pair of pants"
    : isEdit
    ? "Edit your pair of pants"
    : "Add new pair of pants";

  const onClose = () => {
    setActiveModalIndex();
  };

  const reset = () => {
    destroyForm();
    setCurrentPantsPair(undefined);
  };

  const onSubmit = () => {
    handleSubmit((values) => {
      if (currentPantsPair) {
        const currentPantsPairIndex = pants.findIndex(
          ({ id }) => id === currentPantsPair.id
        );
        pants.splice(currentPantsPairIndex, 1, {
          ...currentPantsPair,
          ...values,
        });

        setPants([...pants]);
      } else {
        setPants([
          ...pants,
          {
            type: "pants",
            id: Math.random().toString(36).slice(2),
            ...values,
          },
        ]);
      }
      onClose();
    });
  };

  useEffect(() => {
    if (currentPantsPair) {
      setMode("view");
    } else {
      setMode("submit");
    }
  }, [currentPantsPair]);

  if (!pants) return null;

  return (
    <>
      {pants.length > 0 ? (
        <Grid templateColumns="repeat(3, 1fr)" gap={2}>
          {pants.map((pantsPair) => (
            <OutfitItem
              key={pantsPair.id}
              title={pantsPair.title}
              description={pantsPair.description}
              imageUrl={pantsPair.imageUrl}
              onClick={() => {
                const { title, description, imageUrl } = pantsPair;
                setFormValues({ title, description, imageUrl });
                setCurrentPantsPair(pantsPair);
                setActiveModalIndex(modalIndex);
              }}
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
            No Pants
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            Click on Add and choose Pants to add
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

export default Pants;
