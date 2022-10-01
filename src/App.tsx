import { ChakraProvider } from "@chakra-ui/react";
import { Heading } from "@chakra-ui/react";

function App() {
  return (
    <ChakraProvider>
      <Heading>App working</Heading>
    </ChakraProvider>
  );
}

export default App;
