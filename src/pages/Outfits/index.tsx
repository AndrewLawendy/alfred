import { useState } from "react";
import {
  Box,
  Grid,
  Heading,
  Stack,
  IconButton,
  Icon,
  useDisclosure,
} from "@chakra-ui/react";

import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { MdAdd } from "react-icons/md";
import { Photo } from "pexels";

import OutfitItem from "components/OutfitItem";

import OutfitDetails from "./OutfitDetails";

export interface Outfit {
  id: string;
  shirt: Photo;
  belt: Photo;
  pants: Photo;
  shoes: Photo;
}

const Outfits = () => {
  const [currentOutfit, setCurrentOutfit] = useState<Outfit>();
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const onSubmit = (outfit: Outfit) => {
    if (outfit.id === currentOutfit?.id) {
      const currentOutfitIndex = outfits.findIndex(
        ({ id }) => id === currentOutfit.id
      );
      outfits.splice(currentOutfitIndex, 1, outfit);

      setOutfits([...outfits]);
    } else {
      setOutfits([...outfits, outfit]);
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    if (!destination) return;

    const [droppedItem] = outfits.splice(source.index, 1);
    outfits.splice(destination.index, 0, droppedItem);

    setOutfits([...outfits]);
  };

  return (
    <>
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
                        {...provided.dragHandleProps}
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
                            }}
                          >
                            <Heading as="h6" size="sm">
                              #{index + 1}
                            </Heading>
                          </Box>
                          {Object.values(outfit).length > 0 && (
                            <Grid
                              templateColumns="repeat(4, 1fr)"
                              sx={{ backgroundColor: "white" }}
                            >
                              <OutfitItem
                                imageUrl={outfit.shirt?.src.small || ""}
                              />
                              <OutfitItem
                                imageUrl={outfit.belt?.src.small || ""}
                              />
                              <OutfitItem
                                imageUrl={outfit.pants?.src.small || ""}
                              />
                              <OutfitItem
                                imageUrl={outfit.shoes?.src.small || ""}
                              />
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
        onSubmit={onSubmit}
        currentOutfit={currentOutfit}
      />
    </>
  );
};

export default Outfits;
