import { Route, useLocation } from "wouter";
import { ChakraProvider, Box } from "@chakra-ui/react";
import { motion, MotionConfig } from "framer-motion";

import NestedRoute from "components/NestedRoute";
import Authorized from "components/Authorized";
import Login from "pages/Login";
import Home from "pages/Home";
import Outfits from "pages/Outfits";
import Wardrobe from "pages/Wardrobe";
import Account from "pages/Account";

import Header from "components/Header";
import BottomNav from "components/BottomNav";
import UpdatePrompt from "components/UpdatePrompt";
import ItemScreen from "pages/Wardrobe/ItemScreen";
import OutfitScreen from "pages/Outfits/OutfitScreen";

import theme from "utils/theme";

import "@fontsource/fraunces/600.css";
import "@fontsource/fraunces/700.css";

function App() {
  const [location] = useLocation();
  const tab = location.split("/")[1].toLowerCase();

  return (
    <ChakraProvider theme={theme}>
      <MotionConfig reducedMotion="user">
        <UpdatePrompt />
        <Route path="/login" component={Login} />
        <Authorized>
          <Header />
          <Box sx={{ pt: 6, px: 3, pb: "nav", flexGrow: 1 }} as="main">
            <motion.div
              key={tab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Route path="/" component={Home} />
              <Route path="/Outfits" component={Outfits} />
              <NestedRoute base="/wardrobe">
                <Wardrobe />
              </NestedRoute>
              <Route path="/account" component={Account} />
            </motion.div>
          </Box>
          <BottomNav />
          <OutfitScreen />
          <ItemScreen />
        </Authorized>
      </MotionConfig>
    </ChakraProvider>
  );
}

export default App;
