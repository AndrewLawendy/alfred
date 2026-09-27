import { Button, ButtonProps, Heading, Text } from "@chakra-ui/react";
import { signOut } from "firebase/auth";

import Confirm from "components/Confirm";
import { auth } from "utils/firebase";

const Logout = (props: Omit<ButtonProps, "onClick">) => (
  <Confirm
    message={
      <>
        <Heading size="md">Sign out of Alfred?</Heading>
        <Text sx={{ mt: 1, color: "gray.600" }}>
          Your wardrobe and outfits stay saved to your account.
        </Text>
      </>
    }
    onConfirm={() => signOut(auth)}
    okText="Sign out"
    cancelText="Stay"
  >
    {({ onOpen }) => (
      <Button {...props} onClick={onOpen}>
        Sign out
      </Button>
    )}
  </Confirm>
);

export default Logout;
