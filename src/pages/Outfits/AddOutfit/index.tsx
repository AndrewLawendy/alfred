import { useState, useRef } from "react";
import {
  IconButton,
  Icon,
  Text,
  Box,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  useDisclosure,
  Stack,
  Heading,
  Grid,
} from "@chakra-ui/react";
import {
  MdAdd,
  MdCheck,
  MdArrowBack,
  MdExpand,
  MdCompress,
} from "react-icons/md";
import { Photo } from "pexels";

import { Outfit } from "pages/Outfits";

import OutfitItem from "components/OutfitItem";

import usePexels from "resources/usePexels";

type AddOutfitProps = {
  onSubmit: (outfit: Outfit) => void;
};

const AddOutfit = ({ onSubmit }: AddOutfitProps) => {
  const closetContainerRef = useRef(null);
  const [closetExpanded, setClosetExpanded] = useState(false);
  const [outfit, setOutfit] = useState<Partial<Outfit>>({});
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data: shirts } = usePexels("shirt", 7);
  const { data: belts } = usePexels("belts", 4);
  const { data: pants } = usePexels("pants", 7);
  const { data: shoes } = usePexels("shoes", 5);

  return (
    <>
      <Drawer
        isOpen={isOpen}
        placement="right"
        size="full"
        onClose={onClose}
        onCloseComplete={() => {
          setOutfit({});
        }}
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
            <Text sx={{ flexGrow: 1 }}>Add new outfit</Text>
            <IconButton
              colorScheme="teal"
              onClick={() => {
                onClose();
                onSubmit(outfit as Outfit);
              }}
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
          </DrawerHeader>

          <DrawerBody>
            <Grid templateColumns="repeat(2, 1fr)" gap={2}>
              {Object.values(outfit).map(
                ({ id, photographer, alt, src }: Photo) => (
                  <OutfitItem
                    key={id}
                    title={photographer}
                    description={alt || ""}
                    imageUrl={src.small}
                  />
                )
              )}
            </Grid>

            <Box
              ref={closetContainerRef}
              sx={{
                ".chakra-modal__content-container": {
                  position: "static",
                },
              }}
            />

            <Drawer
              placement="bottom"
              onClose={onClose}
              isOpen={isOpen}
              portalProps={{ containerRef: closetContainerRef }}
              closeOnOverlayClick={false}
            >
              <DrawerContent>
                <DrawerHeader
                  sx={{
                    boxShadow: "reverse-material",
                    borderBottomWidth: "1px",
                    display: "flex",
                  }}
                >
                  <Text sx={{ flexGrow: 1 }}>Build your outfit</Text>
                  <IconButton
                    colorScheme="whiteAlpha"
                    onClick={() => {
                      setClosetExpanded(!closetExpanded);
                    }}
                    aria-label="Back to outfits"
                    size="sm"
                    icon={
                      <Icon
                        as={closetExpanded ? MdCompress : MdExpand}
                        sx={{
                          width: 5,
                          height: 5,
                          color: "black",
                        }}
                      />
                    }
                  />
                </DrawerHeader>
                <DrawerBody
                  sx={{
                    maxHeight: closetExpanded ? "calc(100vh - 128px)" : 400,
                    transition: "max-height 0.3s",
                  }}
                >
                  <Stack>
                    <Heading as="h4" size="lg" marginBottom="2">
                      Shirts
                    </Heading>
                    <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                      {shirts?.photos.map((shirt) => (
                        <OutfitItem
                          key={shirt.id}
                          title={shirt.photographer}
                          description={shirt.alt || ""}
                          imageUrl={shirt.src.small}
                          cursor="pointer"
                          onClick={() => setOutfit({ ...outfit, shirt })}
                        />
                      ))}
                    </Grid>
                    <Heading as="h4" size="lg" marginBottom="2">
                      Belts
                    </Heading>
                    <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                      {belts?.photos.map((belt) => (
                        <OutfitItem
                          key={belt.id}
                          title={belt.photographer}
                          description={belt.alt || ""}
                          imageUrl={belt.src.small}
                          cursor="pointer"
                          onClick={() => setOutfit({ ...outfit, belt })}
                        />
                      ))}
                    </Grid>
                    <Heading as="h4" size="lg" marginBottom="2">
                      Pants
                    </Heading>
                    <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                      {pants?.photos.map((pantsPair) => (
                        <OutfitItem
                          key={pantsPair.id}
                          title={pantsPair.photographer}
                          description={pantsPair.alt || ""}
                          imageUrl={pantsPair.src.small}
                          cursor="pointer"
                          onClick={() =>
                            setOutfit({ ...outfit, pants: pantsPair })
                          }
                        />
                      ))}
                    </Grid>
                    <Heading as="h4" size="lg" marginBottom="2">
                      Shoes
                    </Heading>
                    <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                      {shoes?.photos.map((shoesPair) => (
                        <OutfitItem
                          key={shoesPair.id}
                          title={shoesPair.photographer}
                          description={shoesPair.alt || ""}
                          imageUrl={shoesPair.src.small}
                          cursor="pointer"
                          onClick={() =>
                            setOutfit({ ...outfit, shoes: shoesPair })
                          }
                        />
                      ))}
                    </Grid>
                  </Stack>
                </DrawerBody>
              </DrawerContent>
            </Drawer>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <IconButton
        onClick={onOpen}
        aria-label="Add Outfit"
        size="lg"
        colorScheme="teal"
        icon={
          <Icon
            as={MdAdd}
            color="white"
            sx={{
              width: 7,
              height: 7,
            }}
          />
        }
        sx={{
          position: "fixed",
          bottom: 16,
          right: 3,
          borderRadius: "full",
        }}
      />
    </>
  );
};

export default AddOutfit;
