import { Link } from "wouter";
import { Flex, IconButton, Image } from "@chakra-ui/react";
import { BellIcon } from "@chakra-ui/icons";

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
        boxShadow: "0px 1px var(--chakra-colors-chakra-border-color)",
        position: "sticky",
        top: 0,
        backgroundColor: "white",
      }}
    >
      <SideNav />

      <Link to="/">
        <Image src={Logo} sx={{ maxH: 9 }} />
      </Link>

      <IconButton
        aria-label="Open Notification"
        icon={<BellIcon />}
        variant="ghost"
      />
    </Flex>
  );
};

export default Header;
