import { orderBy } from "@firebase/firestore";
import {
  Badge,
  Box,
  Grid,
  Heading,
  Stack,
  IconButton,
  Icon,
  Flex,
  Text,
} from "@chakra-ui/react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { MdAdd, MdDryCleaning } from "react-icons/md";
import { GrDrag } from "react-icons/gr";

import { openNewOutfit, openOutfit } from "utils/history";
import { Outfit } from "utils/types";

import OutfitReference from "components/OutfitReference";
import Loading from "components/Loading";
import EmptyState from "components/EmptyState";

import useData from "resources/useData";
import useUpdateDocument from "resources/useUpdateDocument";

const fields = ["shirt", "belt", "pants", "shoes"] as const;

const Outfits = () => {
  const [outfits, isOutfitsLoading] = useData<Outfit>(
    "outfits",
    orderBy("order")
  );
  const [updateOutfit] = useUpdateDocument("outfits");

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    if (!destination || !outfits) return;

    const reordered = [...outfits];
    const [dropped] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, dropped);

    // Only write the outfits whose position actually changed
    reordered.forEach((outfit, order) => {
      if (outfit.order !== order) updateOutfit(outfit.id, { order });
    });
  };

  return (
    <>
      {isOutfitsLoading || !outfits ? (
        <Loading message="Loading your outfits" columns={1} />
      ) : outfits.length === 0 ? (
        <EmptyState
          icon={MdDryCleaning}
          title="No outfits yet"
          description="Put together a shirt, belt, pants and shoes. Each outfit you make joins the rotation."
          actionLabel="Create an outfit"
          onAction={openNewOutfit}
        />
      ) : (
        <>
          <Text sx={{ mb: 4, color: "gray.600" }}>
            Alfred lays these out in order, one a day. Drag the handle to change
            what comes next.
          </Text>
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
                            onClick={() => openOutfit(outfit.id)}
                          >
                            <Box
                              sx={{
                                borderRadius: "xl",
                                overflow: "hidden",
                                border: outfit.active
                                  ? "2px solid"
                                  : "1px solid",
                                borderColor: outfit.active
                                  ? "accent.600"
                                  : "gray.200",
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
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <Heading as="h2" size="md">
                                  Outfit #{index + 1}
                                </Heading>

                                <Flex sx={{ gap: 2 }}>
                                  {outfit.active && (
                                    <Badge
                                      colorScheme="accent"
                                      alignSelf="center"
                                    >
                                      Today
                                    </Badge>
                                  )}

                                  <Box
                                    aria-label="Drag to reorder"
                                    sx={{
                                      // 44px touch target around a 16px icon
                                      w: "44px",
                                      h: "44px",
                                      m: -2,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
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
                                  {fields.map((field) => (
                                    <OutfitReference
                                      key={field}
                                      reference={outfit[field]}
                                      aspectRatio={1}
                                    />
                                  ))}
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
        </>
      )}

      <IconButton
        onClick={openNewOutfit}
        aria-label="New outfit"
        size="lg"
        colorScheme="brand"
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
          bottom: "nav",
          right: 3,
          borderRadius: "full",
        }}
      />
    </>
  );
};

export default Outfits;
