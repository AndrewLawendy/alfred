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
import { Reorder } from "framer-motion";
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

  return (
    <>
      <Reorder.Group
        as="div"
        axis="y"
        values={outfits}
        onReorder={(items) => {
          setOutfits(items);
        }}
      >
        <Stack gap={3}>
          {outfits.map((outfit, index) => {
            return (
              <Reorder.Item
                as="div"
                key={outfit.id}
                value={outfit}
                onClick={() => {
                  setCurrentOutfit(outfit);
                  onOpen();
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
                    <OutfitItem imageUrl={outfit.shirt?.src.small || ""} />
                    <OutfitItem imageUrl={outfit.belt?.src.small || ""} />
                    <OutfitItem imageUrl={outfit.pants?.src.small || ""} />
                    <OutfitItem imageUrl={outfit.shoes?.src.small || ""} />
                  </Grid>
                )}
              </Reorder.Item>
            );
          })}
        </Stack>
      </Reorder.Group>

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
