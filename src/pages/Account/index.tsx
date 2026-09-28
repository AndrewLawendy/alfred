import {
  Flex,
  Avatar,
  Box,
  Heading,
  Image,
  Text,
  Icon,
} from "@chakra-ui/react";
import { TbLogout } from "react-icons/tb";

import PageHeader from "components/PageHeader";
import { InstallCard } from "components/Install";
import useAuth from "hooks/useAuth";
import Logo from "assets/logo.png";

import Logout from "./Logout";
import MorningReminder from "./MorningReminder";

const Account = () => {
  const [user] = useAuth();

  if (!user) return null;

  return (
    <>
      <PageHeader title="Account" />
      <Flex
        sx={{
          alignItems: "center",
          gap: 4,
          p: 4,
          borderRadius: "card",
          backgroundColor: "card",
        }}
      >
        <Avatar
          size="lg"
          name={user.displayName || "User"}
          src={user.photoURL || ""}
          sx={{ bg: "brand.500", color: "card", fontFamily: "heading" }}
        />
        <Box sx={{ minW: 0 }}>
          <Heading noOfLines={1} sx={{ fontSize: "xl" }}>
            {user.displayName}
          </Heading>
          {user.email && (
            <Text noOfLines={1} sx={{ color: "gray.600" }}>
              {user.email}
            </Text>
          )}
        </Box>
      </Flex>

      <MorningReminder />
      <InstallCard />

      <Logout
        sx={{ width: "100%", mt: 5 }}
        size="lg"
        variant="outline"
        leftIcon={<Icon w={5} h={5} as={TbLogout} />}
      />

      <Flex
        sx={{ flexDirection: "column", alignItems: "center", gap: 2, mt: 10 }}
      >
        <Image src={Logo} alt="" sx={{ h: 6, opacity: 0.7 }} />
        <Text sx={{ fontSize: "sm", color: "gray.600" }}>
          Alfred {process.env.REACT_APP_VERSION}
        </Text>
      </Flex>
    </>
  );
};

export default Account;
