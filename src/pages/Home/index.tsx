import { Heading, Button, Flex, Grid } from "@chakra-ui/react";

import Weather from "components/Weather";
import OutfitItem from "components/OutfitItem";

const outfit = {
  shirt: {
    title: "Green shirt",
    description: "My favorite shirt",
    imageUrl: "https://i.imgur.com/pzunjFG.jpeg",
  },
  belt: {
    title: "Dark Brown Belt",
    description:
      "Nisi commodo id ea proident ea sunt eu magna esse dolor. Excepteur ex sit nostrud pariatur laboris occaecat velit dolore anim excepteur non incididunt nostrud minim.",
    imageUrl:
      "https://assets-247moms.sfo2.cdn.digitaloceanspaces.com/2013/10/chestnut-belt-300x225.jpg",
  },
  pants: {
    title: "Jeans",
    description: "My day to day pants",
    imageUrl: "https://i.ebayimg.com/images/g/HXYAAOSws3ph~sh6/s-l500.jpg",
  },
  shoes: {
    title: "Safety Boots",
    description:
      "Elit dolore exercitation consectetur aute occaecat elit occaecat occaecat velit consectetur laborum occaecat in laborum.",
    imageUrl:
      "https://www.skechers.com/dw/image/v2/BDCN_PRD/on/demandware.static/-/Library-Sites-SkechersSharedLibrary/default/dwb414fd65/images/grid/SKX52942_ShopByStyleGridUpdate_Men_750x664_Lace_Up_Oxfords.jpg",
  },
};

const Home = () => {
  return (
    <>
      <Flex
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
          height: 12,
          mb: 4,
        }}
      >
        <Heading sx={{ fontFamily: "advent" }}>Hi, Michael</Heading>

        <Weather />
      </Flex>

      <Grid templateColumns="repeat(2, 1fr)" gap={2} sx={{ mb: 20 }}>
        {Object.values(outfit).map(({ title, description, imageUrl }) => (
          <OutfitItem
            key={imageUrl}
            title={title}
            description={description}
            imageUrl={imageUrl}
          />
        ))}
      </Grid>

      <Button
        size="lg"
        sx={{
          backgroundColor: "teal.400",
          color: "white",
          borderRadius: "3xl",
          position: "fixed",
          bottom: 16,
          left: "50%",
          transform: "translate3d(-50%, 0, 0)",
        }}
      >
        Fetch Next Outfit
      </Button>
    </>
  );
};

export default Home;
