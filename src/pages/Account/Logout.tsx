import { Button, ButtonProps, Heading, Text } from "@chakra-ui/react";
import { signOut } from "firebase/auth";

import Confirm from "components/Confirm";
import { auth } from "utils/firebase";

const Logout = (props: Omit<ButtonProps, "onClick">) => (
  <Confirm
    message={
      <>
        <Heading sx={{ fontSize: "2xl" }}>Sign out of Alfred?</Heading>
        <Text sx={{ mt: 2, color: "gray.600" }}>
          Your wardrobe and outfits stay safe in your account. Sign in again any
          time.
        </Text>
      </>
    }
    onConfirm={() => signOut(auth)}
    okText="Sign out"
    okType="red"
    cancelText="Cancel"
  >
    {({ onOpen }) => (
      <Button {...props} onClick={onOpen}>
        Sign out
      </Button>
    )}
  </Confirm>
);

export default Logout;
