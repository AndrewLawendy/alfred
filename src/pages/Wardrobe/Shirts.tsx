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
import Loading from "components/Loading";

import useRequiredForm from "hooks/useRequiredForm";
import useData from "resources/useData";
import useAddDocument from "resources/useAddDocument";
import useUpload from "resources/useUpload";
import geFileURL from "utils/geFileURL";

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
  const [shirts, isShirtLoading] = useData<Shirt>("shirts");
  const [mode, setMode] = useState<"submit" | "view">("view");
  const [currentShirt, setCurrentShirt] = useState<Shirt>();
  const [currentFile, setCurrentFile] = useState<File>();
  const [addShirt] = useAddDocument<Shirt>("shirts");
  const [upload] = useUpload();

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
  const isView = mode === "view" && currentShirt !== undefined;
  const isEdit = mode === "submit" && currentShirt !== undefined;

  const heading = isView
    ? "View your shirt"
    : isEdit
    ? "Edit your shirt"
    : "Add new shirt";

  const onClose = () => {
    setActiveModalIndex();
  };

  const reset = () => {
    destroyForm();
    setCurrentShirt(undefined);
  };

  const onSubmit = () => {
    handleSubmit().then((values) => {
      if (currentShirt) {
        const currentShirtIndex =
          shirts?.findIndex(({ id }) => id === currentShirt.id) || -1;
        shirts?.splice(currentShirtIndex, 1, {
          ...currentShirt,
          ...values,
        });

        // setShirts([...shirts]);
      } else {
        if (currentFile) {
          const { title, description } = values;
          upload(currentFile).then(async (response) => {
            const imageUrl = await geFileURL(response?.metadata.name || "");
            addShirt({
              type: "shirt",
              title,
              description,
              imageUrl,
            });
          });
        }
      }
      onClose();
    });
  };

  useEffect(() => {
    if (currentShirt) {
      setMode("view");
    } else {
      setMode("submit");
    }
  }, [currentShirt]);

  if (isShirtLoading || !shirts) {
    return <Loading message="Loading your shirts, please wait" />;
  }

  return (
    <>
      {shirts.length > 0 ? (
        <Grid templateColumns="repeat(3, 1fr)" gap={2}>
          {shirts.map((shirt) => (
            <OutfitItem
              key={shirt.id}
              title={shirt.title}
              description={shirt.description}
              imageUrl={shirt.imageUrl}
              onClick={() => {
                const { title, description, imageUrl } = shirt;
                setFormValues({ title, description, imageUrl });
                setCurrentShirt(shirt);
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
            No Shirts
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            Click on Add and choose Shirts to add
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
                  setCurrentFile(file);
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

export default Shirts;
