import { Box, Flex } from "@chakra-ui/react";
import {
  MdHome,
  MdOutlineHome,
  MdDryCleaning,
  MdOutlineDryCleaning,
  MdCheckroom,
  MdOutlineCheckroom,
  MdPerson,
  MdPersonOutline,
} from "react-icons/md";

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
        backgroundColor: "linen",
        boxShadow: "0px -1px var(--chakra-colors-chakra-border-color)",
        pb: "env(safe-area-inset-bottom)",
      }}
    >
      <Flex as="nav">
        <BottomNavItem
          to="/"
          label="Home"
          icon={MdOutlineHome}
          activeIcon={MdHome}
        />
        <BottomNavItem
          to="/outfits"
          label="Outfits"
          icon={MdOutlineDryCleaning}
          activeIcon={MdDryCleaning}
        />
        <BottomNavItem
          to="/wardrobe"
          label="Wardrobe"
          icon={MdOutlineCheckroom}
          activeIcon={MdCheckroom}
        />
        <BottomNavItem
          to="/account"
          label="Account"
          icon={MdPersonOutline}
          activeIcon={MdPerson}
        />
      </Flex>
    </Box>
  );
};

export default BottomNav;
