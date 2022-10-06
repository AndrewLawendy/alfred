import {
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Stack,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";

import SideNavItem from "components/SideNavItem";

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
          <DrawerHeader borderBottomWidth="1px">Basic Drawer</DrawerHeader>
          <DrawerBody>
            <Stack>
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
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideNav;
