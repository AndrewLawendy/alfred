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

import OutfitReference from "components/OutfitReference";
import OutfitCover from "components/OutfitCover";
import Loading from "components/Loading";
import PageHeader from "components/PageHeader";
import EmptyState from "components/EmptyState";

import useOutfits from "resources/useOutfits";
import useNotice from "hooks/useNotice";
import useUpdateOutfits from "resources/useUpdateOutfits";

const Outfits = () => {
  const [outfits, isOutfitsLoading] = useOutfits();
  const [updateOutfits] = useUpdateOutfits();
  const toast = useNotice();

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
    ).catch(() =>
      toast({
        status: "error",
        title: "Couldn't save the new order",
        description: "Your outfits keep their old order. Please try again.",
      })
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
        // A photo is enough for an outfit: no wardrobe needed first
        <EmptyState
          title="No outfits yet"
          description="Take one photo of an outfit. 3 is enough to start."
          actionLabel="Add an outfit"
          onAction={openNewOutfit}
        />
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
                            color: "muted",
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
                                color: "accentText",
                              }}
                            >
                              TODAY
                            </Text>
                          )}
                        </Box>
                        <Box sx={{ flex: 1, minW: 0 }} pointerEvents="none">
                          {outfit.name && (
                            <Text
                              noOfLines={1}
                              sx={{
                                mb: 1.5,
                                fontFamily: "heading",
                                fontSize: "lg",
                              }}
                            >
                              {outfit.name}
                            </Text>
                          )}
                          {/* The photo leads the row, as a ringed swatch;
                              then pieces, four swatches in all */}
                          <Grid templateColumns="repeat(4, 1fr)" gap={1.5}>
                            {outfit.photoUrl && (
                              <OutfitCover
                                photoUrl={outfit.photoUrl}
                                size="100%"
                              />
                            )}
                            {outfit.pieces
                              .slice(0, outfit.photoUrl ? 3 : 4)
                              .map((reference) => (
                                <OutfitReference
                                  key={reference.id}
                                  reference={reference}
                                  aspectRatio={1}
                                  radius="thumb"
                                />
                              ))}
                          </Grid>
                          {outfit.photoUrl && !outfit.pieces.length && (
                            <Text
                              sx={{ mt: 1.5, fontSize: "sm", color: "muted" }}
                            >
                              Photo only
                            </Text>
                          )}
                        </Box>
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
