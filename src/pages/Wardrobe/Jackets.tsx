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

import { Jacket } from "utils/types";

type JacketsProps = {
  modalIndex: number;
  activeModalIndex: number | undefined;
  setActiveModalIndex: (index?: number) => void;
};

const Jackets = ({
  modalIndex,
  activeModalIndex,
  setActiveModalIndex,
}: JacketsProps) => {
  const [mode, setMode] = useState<"submit" | "view">("view");
  const [jackets, setJackets] = useState<Jacket[]>([]);
  const [currentJacket, setCurrentJacket] = useState<Jacket>();
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
    maxTemperature: "",
  });

  const isOpen = activeModalIndex === modalIndex;
  const isView = mode === "view" && currentJacket !== undefined;
  const isEdit = mode === "submit" && currentJacket !== undefined;

  const heading = isView
    ? "View your jacket"
    : isEdit
    ? "Edit your jacket"
    : "Add new jacket";

  const onClose = () => {
    setActiveModalIndex();
  };

  const reset = () => {
    destroyForm();
    setCurrentJacket(undefined);
  };

  const onSubmit = () => {
    handleSubmit().then((values) => {
      if (currentJacket) {
        const currentJacketIndex = jackets.findIndex(
          ({ id }) => id === currentJacket.id
        );
        jackets.splice(currentJacketIndex, 1, {
          ...currentJacket,
          ...values,
          maxTemperature: Number(values.maxTemperature),
        });

        setJackets([...jackets]);
      } else {
        setJackets([
          ...jackets,
          {
            type: "jacket",
            id: Math.random().toString(36).slice(2),
            ...values,
            maxTemperature: Number(values.maxTemperature),
          },
        ]);
      }
      onClose();
    });
  };

  useEffect(() => {
    if (currentJacket) {
      setMode("view");
    } else {
      setMode("submit");
    }
  }, [currentJacket]);

  if (!jackets) return null;

  return (
    <>
      {jackets.length > 0 ? (
        <Grid templateColumns="repeat(3, 1fr)" gap={2}>
          {jackets.map((jacket) => (
            <OutfitItem
              key={jacket.id}
              title={jacket.title}
              description={jacket.description}
              imageUrl={jacket.imageUrl}
              onClick={() => {
                const { title, description, imageUrl, maxTemperature } = jacket;
                setFormValues({
                  title,
                  description,
                  imageUrl,
                  maxTemperature: String(maxTemperature),
                });
                setCurrentJacket(jacket);
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
            No Jackets
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            Click on Add and choose Jackets to add
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

              <FormInput
                label="Maximum Temperature in Celsius"
                name="maxTemperature"
                value={values.maxTemperature}
                error={errors.maxTemperature}
                onChange={onChange}
                onBlur={onBlur}
                type="number"
                isReadOnly={mode === "view"}
              />
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Jackets;
