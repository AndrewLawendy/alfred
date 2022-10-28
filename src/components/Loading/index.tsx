import { Box, Spinner, Text } from "@chakra-ui/react";

type LoadingProps = {
  message: string;
};

const Loading = ({ message }: LoadingProps) => (
  <Box sx={{ textAlign: "center", p: 2 }}>
    <Spinner
      thickness="4px"
      speed="0.65s"
      emptyColor="gray.200"
      color="teal.500"
      size="lg"
    />
    <Text>{message}</Text>
  </Box>
);

export default Loading;
