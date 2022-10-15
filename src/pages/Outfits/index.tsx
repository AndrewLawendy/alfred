import { Fragment, useState } from "react";
import AddOutfit from "./AddOutfit";

import { Divider, Grid, Stack } from "@chakra-ui/react";

import OutfitItem from "components/OutfitItem";

export interface Outfit {
  shirt: Item;
  belt: Item;
  pants: Item;
  shoes: Item;
}

export interface Item {
  title: string;
  description: string;
  imageUrl: string;
}

const Outfits = () => {
  const [outfits, setOutfits] = useState<Outfit[]>([]);

  const onSubmit = (outfit: Outfit) => {
    setOutfits([...outfits, outfit]);
  };

  return (
    <Stack>
      {outfits.map((outfit, index, arr) => {
        const isNotLast = index < arr.length - 1;

        return (
          <Fragment key={`outfit-${index}`}>
            <Grid templateColumns="repeat(4, 1fr)" gap={2}>
              {Object.values(outfit).map(({ title, description, imageUrl }) => (
                <OutfitItem
                  isLoaded={true}
                  key={imageUrl}
                  title={title}
                  description={description}
                  imageUrl={imageUrl}
                />
              ))}
            </Grid>
            {isNotLast && <Divider />}
          </Fragment>
        );
      })}
      <AddOutfit onSubmit={onSubmit} />
    </Stack>
  );
};

export default Outfits;
