import { useState, useEffect, useRef } from "react";
import { where, doc } from "firebase/firestore";
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
  ExpandedIndex,
  useToast,
} from "@chakra-ui/react";
import {
  MdCheck,
  MdArrowBack,
  MdExpand,
  MdCompress,
  MdEdit,
} from "react-icons/md";

import { db } from "utils/firebase";
import { Outfit, Shirt, Belt, PantsPair, ShoePair } from "utils/types";

import OutfitItem from "components/OutfitItem";
import OutfitReference from "components/OutfitReference";
import Loading from "components/Loading";

import useData from "resources/useData";

type AddOutfitProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (outfit: Outfit) => void;
  currentOutfit?: Outfit;
};

type OutfitKeys = keyof Omit<
  Outfit,
  "id" | "user" | "createdAt" | "updatedAt" | "order" | "active"
>;

const fields: OutfitKeys[] = ["shirt", "belt", "pants", "shoes"];
const fieldsNameMap: { [key in OutfitKeys]: string } = {
  shirt: "Shirts",
  belt: "Belts",
  pants: "Pants",
  shoes: "Shoes",
};

const OutfitDetails = ({
  isOpen,
  onClose,
  onSubmit,
  currentOutfit,
}: AddOutfitProps) => {
  const closetContainerRef = useRef(null);
  const [closetExpanded, setClosetExpanded] = useState(false);
  const [outfit, setOutfit] = useState<Partial<Outfit>>({});
  const [activeDrawer, setActiveDrawer] = useState<ExpandedIndex>(0);
  const [mode, setMode] = useState<"submit" | "view">("view");
  const toastId = "validation-toast";
  const toast = useToast();
  const [shirts, isShirtLoading] = useData<Shirt>(
    "wardrobe-items",
    where("type", "==", "shirt")
  );
  const [belts, isBeltsLoading] = useData<Belt>(
    "wardrobe-items",
    where("type", "==", "belt")
  );
  const [pants, isPantsLoading] = useData<PantsPair>(
    "wardrobe-items",
    where("type", "==", "pants")
  );
  const [shoes, isShoesLoading] = useData<ShoePair>(
    "wardrobe-items",
    where("type", "==", "shoes")
  );

  const isView = mode === "view" && currentOutfit !== undefined;
  const isEdit = mode === "submit" && currentOutfit !== undefined;
  const isAdd = mode === "submit" && currentOutfit === undefined;
  const heading = isView
    ? "View your outfit"
    : isEdit
    ? "Edit your outfit"
    : "Add new outfit";
  const invalidFields = fields
    .filter((field) => outfit[field] === undefined)
    .map((field) => fieldsNameMap[field]);

  const reset = () => {
    setOutfit({});
    setClosetExpanded(false);
    setActiveDrawer(0);
  };

  const pickActiveDrawer = (index: number) => {
    if (index === activeDrawer) {
      setActiveDrawer([]);
    } else {
      setActiveDrawer(index);
    }
  };

  const submit = () => {
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
      onSubmit({
        id: Math.random().toString(36).slice(2),
        ...outfit,
      } as Outfit);
    }
  };

  useEffect(() => {
    if (currentOutfit) {
      setOutfit(currentOutfit);
      setMode("view");
    } else {
      setMode("submit");
    }
  }, [currentOutfit]);

  return (
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
          {Object.values(outfit).length > 0 && (
            <Grid templateColumns="repeat(2, 1fr)" gap={2}>
              {outfit.shirt && <OutfitReference reference={outfit.shirt} />}
              {outfit.belt && <OutfitReference reference={outfit.belt} />}
              {outfit.pants && <OutfitReference reference={outfit.pants} />}
              {outfit.shoes && <OutfitReference reference={outfit.shoes} />}
            </Grid>
          )}

          {(isAdd || isEdit) && (
            <Box
              ref={closetContainerRef}
              sx={{
                height: 389,

                ".chakra-modal__content-container": {
                  position: "static",
                },
              }}
            />
          )}

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
                    <AccordionButton onClick={() => pickActiveDrawer(0)}>
                      <Heading as="h5" size="md" flex="1" textAlign="left">
                        Shirts
                      </Heading>
                      <AccordionIcon />
                    </AccordionButton>

                    <AccordionPanel>
                      <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                        {isShirtLoading || !shirts ? (
                          <Loading message="Loading your shirts, please wait" />
                        ) : (
                          shirts.map((shirt) => (
                            <OutfitItem
                              key={shirt.id}
                              title={shirt.title}
                              description={shirt.description}
                              imageUrl={shirt.imageUrl}
                              cursor="pointer"
                              onClick={() => {
                                setOutfit({
                                  ...outfit,
                                  shirt: doc(db, "wardrobe-items", shirt.id),
                                });
                                setActiveDrawer((activeDrawer as number) + 1);
                              }}
                            />
                          ))
                        )}
                      </Grid>
                    </AccordionPanel>
                  </AccordionItem>

                  <AccordionItem>
                    <AccordionButton onClick={() => pickActiveDrawer(1)}>
                      <Heading as="h5" size="md" flex="1" textAlign="left">
                        Belts
                      </Heading>
                      <AccordionIcon />
                    </AccordionButton>

                    <AccordionPanel>
                      <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                        {isBeltsLoading || !belts ? (
                          <Loading message="Loading your belts, please wait" />
                        ) : (
                          belts.map((belt) => (
                            <OutfitItem
                              key={belt.id}
                              title={belt.title}
                              description={belt.description}
                              imageUrl={belt.imageUrl}
                              cursor="pointer"
                              onClick={() => {
                                setOutfit({
                                  ...outfit,
                                  belt: doc(db, "wardrobe-items", belt.id),
                                });
                                setActiveDrawer((activeDrawer as number) + 1);
                              }}
                            />
                          ))
                        )}
                      </Grid>
                    </AccordionPanel>
                  </AccordionItem>

                  <AccordionItem>
                    <AccordionButton onClick={() => pickActiveDrawer(2)}>
                      <Heading as="h5" size="md" flex="1" textAlign="left">
                        Pants
                      </Heading>
                      <AccordionIcon />
                    </AccordionButton>

                    <AccordionPanel>
                      <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                        {isPantsLoading || !pants ? (
                          <Loading message="Loading your pants, please wait" />
                        ) : (
                          pants.map((pantsPair) => (
                            <OutfitItem
                              key={pantsPair.id}
                              title={pantsPair.title}
                              description={pantsPair.description}
                              imageUrl={pantsPair.imageUrl}
                              cursor="pointer"
                              onClick={() => {
                                setOutfit({
                                  ...outfit,
                                  pants: doc(
                                    db,
                                    "wardrobe-items",
                                    pantsPair.id
                                  ),
                                });
                                setActiveDrawer((activeDrawer as number) + 1);
                              }}
                            />
                          ))
                        )}
                      </Grid>
                    </AccordionPanel>
                  </AccordionItem>

                  <AccordionItem>
                    <AccordionButton onClick={() => pickActiveDrawer(3)}>
                      <Heading as="h5" size="md" flex="1" textAlign="left">
                        Shoes
                      </Heading>
                      <AccordionIcon />
                    </AccordionButton>

                    <AccordionPanel>
                      <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                        {isShoesLoading || !shoes ? (
                          <Loading message="Loading our shoes, please wait" />
                        ) : (
                          shoes.map((shoesPair) => (
                            <OutfitItem
                              key={shoesPair.id}
                              title={shoesPair.title}
                              description={shoesPair.description}
                              imageUrl={shoesPair.imageUrl}
                              cursor="pointer"
                              onClick={() => {
                                setOutfit({
                                  ...outfit,
                                  shoes: doc(
                                    db,
                                    "wardrobe-items",
                                    shoesPair.id
                                  ),
                                });
                                setClosetExpanded(false);
                              }}
                            />
                          ))
                        )}
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
  );
};

export default OutfitDetails;
