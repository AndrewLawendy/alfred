import { useState } from "react";
import { orderBy } from "@firebase/firestore";
import {
  Box,
  Grid,
  Heading,
  Stack,
  IconButton,
  Icon,
  Flex,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useDisclosure,
} from "@chakra-ui/react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { MdAdd, MdAutoAwesome } from "react-icons/md";
import { GrDrag } from "react-icons/gr";

import { Outfit } from "utils/types";

import OutfitReference from "components/OutfitReference";
import Loading from "components/Loading";

import useData from "resources/useData";
import useUpdateDocument from "resources/useUpdateDocument";

import OutfitDetails from "./OutfitDetails";

const Outfits = () => {
  const [currentOutfit, setCurrentOutfit] = useState<Outfit>();
  const [outfits, isOutfitsLoading] = useData<Outfit>(
    "outfits",
    orderBy("order")
  );
  const [updateOutfit] = useUpdateDocument("outfits");
  const { isOpen, onOpen, onClose } = useDisclosure();

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    if (!destination || !outfits) return;

    const [droppedItem] = outfits.splice(source.index, 1);
    outfits.splice(destination.index, 0, droppedItem);

    outfits.forEach((outfit, index) =>
      updateOutfit(outfit.id, { ...outfit, order: index })
    );
  };

  return (
    <>
      {isOutfitsLoading || !outfits ? (
        <Loading message="Loading your outfits, please wait" />
      ) : outfits.length === 0 ? (
        <Alert
          status="warning"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
        >
          <AlertIcon boxSize="30px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            No outfits
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            Click on Add and gather your outfit
          </AlertDescription>
        </Alert>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="outfits">
            {(provided) => (
              <Stack
                {...provided.droppableProps}
                ref={provided.innerRef}
                sx={{ pb: 14 }}
              >
                {outfits.map((outfit, index) => {
                  return (
                    <Draggable
                      key={outfit.id}
                      draggableId={outfit.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <Box
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          onClick={() => {
                            setCurrentOutfit(outfit);
                            onOpen();
                          }}
                        >
                          <Box
                            sx={{
                              borderTopRadius: 6,
                              transition: "all 0.15s",
                              transform: snapshot.isDragging
                                ? "scale(1.01)"
                                : undefined,
                              boxShadow: snapshot.isDragging
                                ? "material"
                                : undefined,
                            }}
                          >
                            <Box
                              sx={{
                                p: 2,
                                backgroundColor: "white",
                                borderTopRadius: 6,
                                borderTop: "1px solid",
                                borderX: "1px solid",
                                borderColor: "gray.100",
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <Heading as="h6" size="sm">
                                #{index + 1}
                              </Heading>

                              <Flex sx={{ gap: 2 }}>
                                {outfit.active && <Icon as={MdAutoAwesome} />}

                                <Box
                                  as="i"
                                  sx={{ height: "16px" }}
                                  {...provided.dragHandleProps}
                                >
                                  <Icon as={GrDrag} />
                                </Box>
                              </Flex>
                            </Box>
                            {Object.values(outfit).length > 0 && (
                              <Grid
                                templateColumns="repeat(4, 1fr)"
                                sx={{ backgroundColor: "white" }}
                                pointerEvents="none"
                              >
                                <OutfitReference reference={outfit.shirt} />
                                <OutfitReference reference={outfit.belt} />
                                <OutfitReference reference={outfit.pants} />
                                <OutfitReference reference={outfit.shoes} />
                              </Grid>
                            )}
                          </Box>
                        </Box>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </Stack>
            )}
          </Droppable>
        </DragDropContext>
      )}

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
          boxShadow: "material",
          position: "fixed",
          bottom: 16,
          right: 3,
          borderRadius: "full",
        }}
      />

      <OutfitDetails
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setCurrentOutfit(undefined);
        }}
        currentOutfit={currentOutfit}
        outfits={outfits}
      />
    </>
  );
};

export default Outfits;
