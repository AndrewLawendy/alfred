import { Flex, Avatar, Heading, Text, Icon } from "@chakra-ui/react";
import { MdLogout } from "react-icons/md";

import Logout from "./Logout";

import useAuth from "hooks/useAuth";

const Account = () => {
  const [user] = useAuth();

  if (!user) return null;

  return (
    <Flex sx={{ flexDirection: "column", alignItems: "center", gap: 1 }}>
      <Avatar
        size="xl"
        name={user.displayName || "User"}
        src={user.photoURL || ""}
        mb={3}
      />
      <Heading size="md">{user.displayName}</Heading>
      {user.email && <Text sx={{ color: "gray.600" }}>{user.email}</Text>}

      <Logout
        sx={{ width: "100%", mt: 10 }}
        colorScheme="red"
        variant="outline"
        leftIcon={<Icon w={5} h={5} as={MdLogout} />}
      />
      <Text sx={{ mt: 4, fontSize: "sm", color: "gray.500" }}>
        Alfred v{process.env.REACT_APP_VERSION}
      </Text>
    </Flex>
  );
};

export default Account;
