import { Box, Flex } from "@chakra-ui/react";
import { MdHome } from "react-icons/md";
import { GiClothes } from "react-icons/gi";
import { FaTshirt } from "react-icons/fa";

import BottomNavItem from "components/BottomNavItem";

const BottomNav = () => {
  return (
    <Box
      as="footer"
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        backgroundColor: "white",
        boxShadow: "0px -1px var(--chakra-colors-chakra-border-color)",
      }}
    >
      <Flex as="nav" justify="space-between" sx={{ p: 1 }}>
        <BottomNavItem to="/" label="Home" icon={MdHome} />
        <BottomNavItem to="/outfits" label="Outfits" icon={FaTshirt} />
        <BottomNavItem to="/wardrobe" label="Wardrobe" icon={GiClothes} />
      </Flex>
    </Box>
  );
};

export default BottomNav;
