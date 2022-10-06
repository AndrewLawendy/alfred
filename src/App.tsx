import { Route } from "wouter";
import { ChakraProvider, Box } from "@chakra-ui/react";

import Home from "pages/Home";

import Header from "components/Header";

function App() {
  return (
    <ChakraProvider>
      <Header />
      <Box sx={{ p: 2 }} as="main">
        <Route path="/" component={Home} />
      </Box>
    </ChakraProvider>
  );
}

export default App;
