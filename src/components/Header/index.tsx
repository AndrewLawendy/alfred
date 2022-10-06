import { Flex, IconButton, Image } from "@chakra-ui/react";
import { InfoOutlineIcon } from "@chakra-ui/icons";

import Logo from "assets/logo.png";

import SideNav from "components/SideNav";

const Header = () => {
  return (
    <Flex
      as="header"
      sx={{
        height: 16,
        p: 2,
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <SideNav />

      <Image src={Logo} sx={{ maxH: 9 }} />

      <IconButton
        aria-label="Open Notification"
        icon={<InfoOutlineIcon />}
        variant="ghost"
      />
    </Flex>
  );
};

export default Header;
