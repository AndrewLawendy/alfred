import {
  Heading,
  Text,
  Button,
  Flex,
  Stack,
  Image,
  Box,
  Divider,
} from "@chakra-ui/react";

import Weather from "components/Weather";

const outfit = {
  shirt: {
    title: "Green shirt",
    description: "My favorite shirt",
    imageUrl: "https://i.imgur.com/pzunjFG.jpeg",
  },
  belt: {
    title: "Dark Brown Belt",
    description: "",
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
    description: "",
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

      <Heading as="h4" size="md" sx={{ mb: 4 }}>
        Your outfit for today
      </Heading>

      <Stack sx={{ mb: 24 }}>
        {Object.values(outfit).map(
          ({ title, description, imageUrl }, index, arr) => {
            const isNotLast = index < arr.length - 1;

            return (
              <>
                <Flex key={imageUrl}>
                  <Image src={imageUrl} w="33.330%" objectFit="cover" />
                  <Box w="66.66%" sx={{ p: 2 }}>
                    <Heading as="h3" size="md">
                      {title}
                    </Heading>
                    <Text>{description}</Text>
                  </Box>
                </Flex>
                {isNotLast && <Divider />}
              </>
            );
          }
        )}
      </Stack>

      <Button
        size="lg"
        sx={{
          backgroundColor: "teal.400",
          color: "white",
          borderRadius: "3xl",
          position: "fixed",
          bottom: 6,
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
