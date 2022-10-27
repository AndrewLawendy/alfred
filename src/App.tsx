import { Route } from "wouter";
import { ChakraProvider, Box } from "@chakra-ui/react";

import Authorized from "components/Authorized";
import Login from "pages/Login";
import Home from "pages/Home";
import Outfits from "pages/Outfits";
import Wardrobe from "pages/Wardrobe";

import Header from "components/Header";
import BottomNav from "components/BottomNav";

import theme from "utils/theme";

import "@fontsource/advent-pro";
import "@fontsource/roboto";

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Route path="/login" component={Login} />
      <Authorized>
        <Header />
        <Box sx={{ pt: 3, px: 3, pb: 16, flexGrow: 1 }} as="main">
          <Route path="/" component={Home} />
          <Route path="/Outfits" component={Outfits} />
          <Route path="/wardrobe" component={Wardrobe} />
        </Box>
        <BottomNav />
      </Authorized>
    </ChakraProvider>
  );
}

export default App;
