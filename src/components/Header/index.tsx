import { Link } from "wouter";
import {
  Flex,
  IconButton,
  Image,
  Text,
  Link as ChakraLink,
  Icon,
} from "@chakra-ui/react";
import { IoMdNotifications } from "react-icons/io";

import Logo from "assets/logo.png";

const Header = () => {
  return (
    <Flex
      as="header"
      sx={{
        height: 16,
        p: 2,
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "material",
        position: "sticky",
        top: 0,
        backgroundColor: "white",
      }}
    >
      <ChakraLink
        as={Link}
        to="/"
        sx={{ display: "flex", alignItems: "center", gap: 3 }}
      >
        <Image src={Logo} sx={{ maxH: 9 }} />
        <Text
          sx={{
            fontFamily: "advent",
            fontSize: "2xl",
            lineHeight: 6,
          }}
        >
          Alfred{" "}
          <Text as="span" fontSize="md">
            v{process.env.REACT_APP_VERSION}
          </Text>
        </Text>
      </ChakraLink>

      <IconButton
        aria-label="Open Notification"
        icon={<Icon as={IoMdNotifications} w={6} h={6} />}
        variant="ghost"
      />
    </Flex>
  );
};

export default Header;
