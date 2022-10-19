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
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Heading,
  Grid,
  UnorderedList,
  ListItem,
  useDisclosure,
  useToast,
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

type OutfitKeys = keyof Outfit;

const AddOutfit = ({ onSubmit }: AddOutfitProps) => {
  const closetContainerRef = useRef(null);
  const [closetExpanded, setClosetExpanded] = useState(false);
  const [outfit, setOutfit] = useState<Partial<Outfit>>({});
  const [activeDrawer, setActiveDrawer] = useState(0);
  const toastId = "validation-toast";
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data: shirts } = usePexels("shirt", 7);
  const { data: belts } = usePexels("belts", 4);
  const { data: pants } = usePexels("pants", 7);
  const { data: shoes } = usePexels("shoes", 5);

  const fields: OutfitKeys[] = ["shirt", "belt", "pants", "shoes"];
  const invalidFields = fields.filter((item) => outfit[item] === undefined);

  const reset = () => {
    setOutfit({});
    setClosetExpanded(false);
    setActiveDrawer(0);
  };

  return (
    <>
      <Drawer
        isOpen={isOpen}
        placement="right"
        size="full"
        onClose={onClose}
        onCloseComplete={reset}
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
                if (invalidFields.length > 0) {
                  if (!toast.isActive(toastId)) {
                    toast({
                      id: toastId,
                      title: "These fields are still missing:",
                      status: "error",
                      description: (
                        <UnorderedList>
                          {invalidFields.map((field) => (
                            <ListItem key={field}>{field}</ListItem>
                          ))}
                        </UnorderedList>
                      ),
                      isClosable: true,
                    });
                  }
                } else {
                  onClose();
                  onSubmit(outfit as Outfit);
                }
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
                height: 389,

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
              blockScrollOnMount={false}
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
                    p: 0,
                    maxHeight: closetExpanded ? "calc(100vh - 128px)" : 300,
                    transition: "max-height 0.3s",
                  }}
                >
                  <Accordion index={activeDrawer}>
                    <AccordionItem>
                      <AccordionButton onClick={() => setActiveDrawer(0)}>
                        <Heading as="h5" size="md" flex="1" textAlign="left">
                          Shirts
                        </Heading>
                        <AccordionIcon />
                      </AccordionButton>

                      <AccordionPanel>
                        <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                          {shirts?.photos.map((shirt) => (
                            <OutfitItem
                              key={shirt.id}
                              title={shirt.photographer}
                              description={shirt.alt || ""}
                              imageUrl={shirt.src.small}
                              cursor="pointer"
                              onClick={() => {
                                setOutfit({ ...outfit, shirt });
                                setActiveDrawer(activeDrawer + 1);
                              }}
                            />
                          ))}
                        </Grid>
                      </AccordionPanel>
                    </AccordionItem>

                    <AccordionItem>
                      <AccordionButton onClick={() => setActiveDrawer(1)}>
                        <Heading as="h5" size="md" flex="1" textAlign="left">
                          Belts
                        </Heading>
                        <AccordionIcon />
                      </AccordionButton>

                      <AccordionPanel>
                        <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                          {belts?.photos.map((belt) => (
                            <OutfitItem
                              key={belt.id}
                              title={belt.photographer}
                              description={belt.alt || ""}
                              imageUrl={belt.src.small}
                              cursor="pointer"
                              onClick={() => {
                                setOutfit({ ...outfit, belt });
                                setActiveDrawer(activeDrawer + 1);
                              }}
                            />
                          ))}
                        </Grid>
                      </AccordionPanel>
                    </AccordionItem>

                    <AccordionItem>
                      <AccordionButton onClick={() => setActiveDrawer(2)}>
                        <Heading as="h5" size="md" flex="1" textAlign="left">
                          Pants
                        </Heading>
                        <AccordionIcon />
                      </AccordionButton>

                      <AccordionPanel>
                        <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                          {pants?.photos.map((pantsPair) => (
                            <OutfitItem
                              key={pantsPair.id}
                              title={pantsPair.photographer}
                              description={pantsPair.alt || ""}
                              imageUrl={pantsPair.src.small}
                              cursor="pointer"
                              onClick={() => {
                                setOutfit({ ...outfit, pants: pantsPair });
                                setActiveDrawer(activeDrawer + 1);
                              }}
                            />
                          ))}
                        </Grid>
                      </AccordionPanel>
                    </AccordionItem>

                    <AccordionItem>
                      <AccordionButton onClick={() => setActiveDrawer(3)}>
                        <Heading as="h5" size="md" flex="1" textAlign="left">
                          Shoes
                        </Heading>
                        <AccordionIcon />
                      </AccordionButton>

                      <AccordionPanel>
                        <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                          {shoes?.photos.map((shoesPair) => (
                            <OutfitItem
                              key={shoesPair.id}
                              title={shoesPair.photographer}
                              description={shoesPair.alt || ""}
                              imageUrl={shoesPair.src.small}
                              cursor="pointer"
                              onClick={() => {
                                setOutfit({ ...outfit, shoes: shoesPair });
                                setClosetExpanded(false);
                              }}
                            />
                          ))}
                        </Grid>
                      </AccordionPanel>
                    </AccordionItem>
                  </Accordion>
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
