import { useState } from "react";
import { Grid } from "@chakra-ui/react";
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
    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
      {outfits.map((outfit, index) => {
        return (
          <Grid
            key={`outfit-${index}`}
            templateColumns="repeat(2, 1fr)"
            sx={{ backgroundColor: "white" }}
          >
            {Object.values(outfit).map(({ id, src }: Photo) => (
              <OutfitItem key={id} imageUrl={src.small} />
            ))}
          </Grid>
        );
      })}
      <AddOutfit onSubmit={onSubmit} />
    </Grid>
  );
};

export default Outfits;
