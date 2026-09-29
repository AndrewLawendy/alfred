import { Box, Flex } from "@chakra-ui/react";
import { TbShirt, TbStack2, TbSun, TbUser } from "react-icons/tb";

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
        // Translucent so the page shows through as it scrolls underneath
        backgroundColor: "pageGlass",
        backdropFilter: "blur(12px)",
        borderTop: "1px solid",
        borderColor: "line",
        pb: "env(safe-area-inset-bottom)",
      }}
    >
      <Flex as="nav" aria-label="Main">
        <BottomNavItem to="/" label="Today" icon={TbSun} />
        <BottomNavItem to="/outfits" label="Outfits" icon={TbStack2} />
        <BottomNavItem to="/wardrobe" label="Wardrobe" icon={TbShirt} />
        <BottomNavItem to="/account" label="Account" icon={TbUser} />
      </Flex>
    </Box>
  );
};

export default BottomNav;
