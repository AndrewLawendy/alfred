import { Heading, Button, Flex } from "@chakra-ui/react";

import Weather from "components/Weather";

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
        <Heading>Hi, Michael</Heading>

        <Weather />
      </Flex>

      <Heading as="h4" size="md" sx={{ fontFamily: "font.body", mb: 4 }}>
        Your outfit for today
      </Heading>

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
