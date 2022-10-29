import { Button, ButtonProps } from "@chakra-ui/react";
import { signOut } from "firebase/auth";

import { auth } from "utils/firebase";

const Logout = (props: Omit<ButtonProps, "onClick">) => {
  return (
    <Button {...props} onClick={() => signOut(auth)}>
      Logout
    </Button>
  );
};

export default Logout;
