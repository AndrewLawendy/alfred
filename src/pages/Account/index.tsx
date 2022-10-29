import { Box, Avatar, Text, Icon } from "@chakra-ui/react";
import { BiLogOut } from "react-icons/bi";

import Logout from "./Logout";

import useAuth from "hooks/useAuth";

const Account = () => {
  const [user] = useAuth();

  if (!user) return null;

  return (
    <>
      <Box sx={{ display: "flex", gap: 4, mb: 10 }}>
        <Avatar
          size="lg"
          name={user.displayName || "User"}
          src={user.photoURL || ""}
        />
        <Text sx={{ fontWeight: "semibold" }}>{user.displayName}</Text>
      </Box>

      <Logout
        sx={{ width: "100%", color: "black", justifyContent: "flex-start" }}
        colorScheme="whiteAlpha"
        leftIcon={<Icon w={5} h={5} as={BiLogOut} />}
      />
    </>
  );
};

export default Account;
