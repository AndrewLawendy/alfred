import { Route } from "wouter";
import { ChakraProvider, Box } from "@chakra-ui/react";

import Home from "pages/Home";
import Overview from "pages/Overview";
import Wardrobe from "pages/Wardrobe";

import Header from "components/Header";

import theme from "utils/theme";

import "@fontsource/advent-pro";
import "@fontsource/roboto";

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Header />
      <Box sx={{ p: 2 }} as="main">
        <Route path="/" component={Home} />
        <Route path="/overview" component={Overview} />
        <Route path="/wardrobe" component={Wardrobe} />
      </Box>
    </ChakraProvider>
  );
}

export default App;
