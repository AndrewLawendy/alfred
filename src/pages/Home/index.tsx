import { Heading, Button, Flex, Grid } from "@chakra-ui/react";

import Weather from "components/Weather";
import OutfitItem from "components/OutfitItem";

import usePexels from "resources/usePexels";

const Home = () => {
  const { data: shirtData, isLoading: isShirtLoading } = usePexels("shirt", 1);
  const { data: beltData, isLoading: isBeltLoading } = usePexels("belt", 1);
  const { data: pantsData, isLoading: isPantsLoading } = usePexels("pants", 1);
  const { data: shoesData, isLoading: isShoesLoading } = usePexels("shoes", 1);

  const isLoading =
    !shirtData ||
    !beltData ||
    !pantsData ||
    !shoesData ||
    isShirtLoading ||
    isBeltLoading ||
    isPantsLoading ||
    isShoesLoading;
  const [shirt] = shirtData?.photos || [];
  const [belt] = beltData?.photos || [];
  const [pants] = pantsData?.photos || [];
  const [shoes] = shoesData?.photos || [];

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
        <OutfitItem
          isLoaded={!isLoading}
          title={shirt?.photographer}
          description={shirt?.alt || ""}
          imageUrl={shirt?.src.small}
        />
        <OutfitItem
          isLoaded={!isLoading}
          title={belt?.photographer}
          description={belt?.alt || ""}
          imageUrl={belt?.src.small}
        />
        <OutfitItem
          isLoaded={!isLoading}
          title={pants?.photographer}
          description={pants?.alt || ""}
          imageUrl={pants?.src.small}
        />
        <OutfitItem
          isLoaded={!isLoading}
          title={shoes?.photographer}
          description={shoes?.alt || ""}
          imageUrl={shoes?.src.small}
        />
      </Grid>

      <Button
        size="lg"
        colorScheme="teal"
        sx={{
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
