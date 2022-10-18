import { useState } from "react";
import { Box, Grid, Heading, Stack } from "@chakra-ui/react";
import { Photo } from "pexels";

import OutfitItem from "components/OutfitItem";

import AddOutfit from "./AddOutfit";

export interface Outfit {
  shirt: Photo;
  belt: Photo;
  pants: Photo;
  shoes: Photo;
}

const Outfits = () => {
  const [outfits, setOutfits] = useState<Outfit[]>([]);

  const onSubmit = (outfit: Outfit) => {
    setOutfits([...outfits, outfit]);
  };

  return (
    <Stack gap={3}>
      {outfits.map((outfit, index) => {
        return (
          <Box key={`outfit-${index}`}>
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
            <Grid
              templateColumns="repeat(4, 1fr)"
              sx={{ backgroundColor: "white" }}
            >
              {Object.values(outfit).map(({ id, src }: Photo) => (
                <OutfitItem key={id} imageUrl={src.small} />
              ))}
            </Grid>
          </Box>
        );
      })}
      <AddOutfit onSubmit={onSubmit} />
    </Stack>
  );
};

export default Outfits;
