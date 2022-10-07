import {
  useDisclosure,
  IconButton,
  Drawer,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Stack,
  Image,
  Text,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";

import SideNavItem from "components/SideNavItem";

import Logo from "assets/logo.png";

const SideNav = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <IconButton
        aria-label="Open Navigation"
        icon={<HamburgerIcon />}
        variant="ghost"
        onClick={onOpen}
      />

      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader
            borderBottomWidth="1px"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            <Image alt="Logo" src={Logo} sx={{ height: 6 }} />
            <Text
              sx={{
                fontFamily: "advent",
                fontSize: "2xl",
                lineHeight: 6,
              }}
            >
              Alfred
            </Text>
          </DrawerHeader>
          <Stack sx={{ py: 2, px: 3 }}>
            <SideNavItem to="/" onClick={onClose}>
              Home
            </SideNavItem>
            <SideNavItem to="/overview" onClick={onClose}>
              Overview
            </SideNavItem>
            <SideNavItem to="/wardrobe" onClick={onClose}>
              My Wardrobe
            </SideNavItem>
          </Stack>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideNav;
