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

import { ShoePair } from "utils/types";

type ShoesProps = {
  modalIndex: number;
  activeModalIndex: number | undefined;
  setActiveModalIndex: (index?: number) => void;
};

const Shoes = ({
  modalIndex,
  activeModalIndex,
  setActiveModalIndex,
}: ShoesProps) => {
  const [mode, setMode] = useState<"submit" | "view">("view");
  const [shoes, setShoes] = useState<ShoePair[]>([]);
  const [currentShoePair, setCurrentShoePair] = useState<ShoePair>();
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
  const isView = mode === "view" && currentShoePair !== undefined;
  const isEdit = mode === "submit" && currentShoePair !== undefined;

  const heading = isView
    ? "View your shoes"
    : isEdit
    ? "Edit your shoes"
    : "Add new shoes";

  const onClose = () => {
    setActiveModalIndex();
  };

  const reset = () => {
    destroyForm();
    setCurrentShoePair(undefined);
  };

  const onSubmit = () => {
    handleSubmit((values) => {
      if (currentShoePair) {
        const currentShoePairIndex = shoes.findIndex(
          ({ id }) => id === currentShoePair.id
        );
        shoes.splice(currentShoePairIndex, 1, {
          ...currentShoePair,
          ...values,
        });

        setShoes([...shoes]);
      } else {
        setShoes([
          ...shoes,
          {
            type: "shoes",
            id: Math.random().toString(36).slice(2),
            ...values,
          },
        ]);
      }
      onClose();
    });
  };

  useEffect(() => {
    if (currentShoePair) {
      setMode("view");
    } else {
      setMode("submit");
    }
  }, [currentShoePair]);

  if (!shoes) return null;

  return (
    <>
      {shoes.length > 0 ? (
        <Grid
          templateColumns="repeat(3, 1fr)"
          gap={2}
          sx={{ backgroundColor: "white" }}
        >
          {shoes.map((shoePair) => (
            <OutfitItem
              key={shoePair.id}
              title={shoePair.title}
              description={shoePair.description}
              imageUrl={shoePair.imageUrl}
              onClick={() => {
                const { title, description, imageUrl } = shoePair;
                setFormValues({ title, description, imageUrl });
                setCurrentShoePair(shoePair);
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
            No Shoes
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            Click on Add and choose Shoes to add
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

export default Shoes;
