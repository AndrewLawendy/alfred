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

import { Outfit } from "utils/types";

import OutfitReference from "components/OutfitReference";
import Loading from "components/Loading";

import useData from "resources/useData";
import useAddDocument from "resources/useAddDocument";
// import useUpdateDocument from "resources/useUpdateDocument";
// import useDeleteDocument from "resources/useDeleteDocument";

import OutfitDetails from "./OutfitDetails";

const Outfits = () => {
  const [currentOutfit, setCurrentOutfit] = useState<Outfit>();
  const [outfits, isOutfitsLoading] = useData<Outfit>("outfits");
  const [addOutfit] = useAddDocument<Outfit>("outfits");
  // const [deleteOutfit, isDeletingOutfit] = useDeleteDocument("outfits");
  // const [updateOutfit, isUpdateOutfitLoading] = useUpdateDocument("outfits");
  const { isOpen, onOpen, onClose } = useDisclosure();

  const onSubmit = (outfit: Outfit) => {
    const isNewOutfit = outfit.id === currentOutfit?.id;

    if (outfits === undefined) return;

    if (isNewOutfit) {
      const currentOutfitIndex = outfits.findIndex(
        ({ id }) => id === currentOutfit.id
      );
      outfits.splice(currentOutfitIndex, 1, outfit);
    } else {
      addOutfit({
        ...outfit,
        order: outfits.length ?? 0,
        active: outfits.length < 1,
      });
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { destination } = result;
    if (!destination) return;

    console.log(result);

    // const [droppedItem] = outfits.splice(source.index, 1);
    // outfits.splice(destination.index, 0, droppedItem);

    // setOutfits([...outfits]);
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
              {isOutfitsLoading || !outfits ? (
                <Loading message="Loading your outfits, please wait" />
              ) : (
                outfits.map((outfit, index) => {
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
                })
              )}
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
