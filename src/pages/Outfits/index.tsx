import { orderBy } from "@firebase/firestore";
import {
  Box,
  Grid,
  Heading,
  Stack,
  Button,
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
import { MdAdd, MdDragIndicator } from "react-icons/md";

import { openNewOutfit, openOutfit } from "utils/history";
import { Item, Outfit } from "utils/types";

import OutfitReference from "components/OutfitReference";
import Loading from "components/Loading";
import PageHeader from "components/PageHeader";
import EmptyState from "components/EmptyState";

import useData from "resources/useData";
import useUpdateOutfits from "resources/useUpdateOutfits";

const fields = ["shirt", "belt", "pants", "shoes"] as const;

const Outfits = () => {
  const [outfits, isOutfitsLoading] = useData<Outfit>(
    "outfits",
    orderBy("order")
  );
  const [updateOutfits] = useUpdateOutfits();
  // With no clothes yet, the wardrobe comes before any outfit
  const [items] = useData<Item>("wardrobe-items");

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    if (!destination || !outfits) return;

    const reordered = [...outfits];
    const [dropped] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, dropped);

    // Only write the outfits whose position actually changed
    updateOutfits(
      reordered
        .map((outfit, order) => ({ id: outfit.id, order, old: outfit.order }))
        .filter(({ order, old }) => order !== old)
        .map(({ id, order }) => ({ id, changes: { order } }))
    );
  };

  return (
    <>
      <PageHeader
        eyebrow="Rotation"
        title="Outfits"
        description="Alfred wears these in order, top to bottom, then starts again. Hold the handle and drag to change the order."
        action={
          <Button
            onClick={openNewOutfit}
            leftIcon={<Icon as={MdAdd} sx={{ w: 5, h: 5 }} />}
            colorScheme="brand"
            sx={{ flexShrink: 0 }}
          >
            New
          </Button>
        }
      />
      {isOutfitsLoading || !outfits ? (
        <Loading message="Loading your outfits" columns={1} />
      ) : outfits.length === 0 ? (
        items && items.length === 0 ? (
          <EmptyState
            title="Your wardrobe comes first"
            description="Outfits are made from your own clothes. Add a shirt, belt, pants and shoes to your wardrobe, then come back here."
            actionLabel="Go to Wardrobe"
            to="/wardrobe"
          />
        ) : (
          <EmptyState
            title="No outfits yet"
            description="Put together a shirt, belt, pants and shoes. Each outfit you make joins the rotation."
            actionLabel="Create an outfit"
            onAction={openNewOutfit}
          />
        )
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="outfits">
            {(provided) => (
              <Stack
                {...provided.droppableProps}
                ref={provided.innerRef}
                spacing={3}
                sx={{ pb: 4 }}
              >
                {outfits.map((outfit, index) => (
                  <Draggable
                    key={outfit.id}
                    draggableId={outfit.id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <Flex
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        onClick={() => openOutfit(outfit.id)}
                        role="button"
                        aria-label={`Outfit No. ${index + 1}`}
                        sx={{
                          alignItems: "center",
                          gap: 2,
                          py: 3,
                          pr: 3,
                          borderRadius: "card",
                          backgroundColor: "card",
                          border: "1px solid",
                          // Today's outfit is edged in brass
                          borderColor: outfit.active
                            ? "accent.500"
                            : "transparent",
                          transition: "transform 0.15s",
                          transform: snapshot.isDragging
                            ? "scale(1.02)"
                            : undefined,
                        }}
                      >
                        <Flex
                          aria-label={`Reorder outfit ${index + 1}`}
                          sx={{
                            // A tall handle: easy to find with a thumb
                            w: 10,
                            alignSelf: "stretch",
                            minH: 20,
                            alignItems: "center",
                            justifyContent: "center",
                            color: "gray.600",
                            flexShrink: 0,
                          }}
                          {...provided.dragHandleProps}
                        >
                          <Icon as={MdDragIndicator} sx={{ w: 6, h: 6 }} />
                        </Flex>
                        <Box sx={{ w: 12, flexShrink: 0 }}>
                          <Heading
                            as="h2"
                            sx={{ fontSize: "3xl", lineHeight: 1 }}
                          >
                            {index + 1}
                          </Heading>
                          {outfit.active && (
                            <Text
                              sx={{
                                mt: 1.5,
                                fontSize: "xs",
                                fontWeight: "semibold",
                                letterSpacing: "0.12em",
                                color: "accent.600",
                              }}
                            >
                              TODAY
                            </Text>
                          )}
                        </Box>
                        <Grid
                          templateColumns="repeat(4, 1fr)"
                          gap={1.5}
                          sx={{ flex: 1, minW: 0 }}
                          pointerEvents="none"
                        >
                          {fields.map((field) => (
                            <OutfitReference
                              key={field}
                              reference={outfit[field]}
                              aspectRatio={1}
                              radius="thumb"
                            />
                          ))}
                        </Grid>
                      </Flex>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Stack>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </>
  );
};

export default Outfits;
