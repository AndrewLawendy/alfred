import { orderBy } from "@firebase/firestore";
import {
  Badge,
  Box,
  Grid,
  Heading,
  Stack,
  Button,
  Icon,
  Flex,
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
import PageHeader from "components/PageHeader";
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
      <PageHeader
        title="Outfits"
        subtitle="Worn in order, one a day. Drag to reorder."
        action={
          <Button
            onClick={openNewOutfit}
            leftIcon={<Icon as={MdAdd} sx={{ w: 5, h: 5 }} />}
            colorScheme="brand"
            sx={{ minH: "44px", borderRadius: "full", flexShrink: 0 }}
          >
            New
          </Button>
        }
      />
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
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="outfits">
              {(provided) => (
                <Stack
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  sx={{ pb: 4 }}
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
    </>
  );
};

export default Outfits;
