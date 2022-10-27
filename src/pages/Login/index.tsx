import { useEffect } from "react";
import { useLocation } from "wouter";
import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithRedirect,
} from "firebase/auth";
import { Button } from "@chakra-ui/react";

import useAuth from "hooks/useAuth";
import { auth } from "utils/firebase";

const googleAuthProvider = new GoogleAuthProvider();
const facebookAuthProvider = new FacebookAuthProvider();

const Login = () => {
  const [user] = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user) {
      setLocation("/", { replace: true });
    }
  }, [user]);

  return (
    <>
      <Button
        colorScheme="facebook"
        onClick={() => signInWithRedirect(auth, facebookAuthProvider)}
      >
        Login with Facebook
      </Button>
      <Button
        colorScheme="red"
        onClick={() => signInWithRedirect(auth, googleAuthProvider)}
      >
        Login with Google
      </Button>
    </>
  );
};

export default Login;
