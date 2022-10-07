import { Heading, Button } from "@chakra-ui/react";

const Home = () => {
  return (
    <>
      <Heading>Home</Heading>

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
