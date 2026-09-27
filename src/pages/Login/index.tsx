import { useEffect } from "react";
import { useLocation } from "wouter";
import {
  AuthProvider,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithRedirect,
  signInWithPopup,
} from "firebase/auth";
import {
  Box,
  Button,
  Image,
  Heading,
  Text,
  Icon,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { FaFacebookSquare } from "react-icons/fa";
import { motion } from "framer-motion";

import useAuth from "hooks/useAuth";
import { auth } from "utils/firebase";

import Logo from "assets/logo.png";
import { GoogleLogo } from "components/Icons";

const googleAuthProvider = new GoogleAuthProvider();
const facebookAuthProvider = new FacebookAuthProvider();

// Redirect only works on the auth domain itself: elsewhere (localhost, web.app,
// preview channels) browsers block the third-party storage it relies on.
// https://firebase.google.com/docs/auth/web/redirect-best-practices
const signIn =
  window.location.hostname === auth.config.authDomain
    ? signInWithRedirect
    : signInWithPopup;

// Plain words for the errors people actually run into
const friendlyError = (code?: string) =>
  ({
    "auth/popup-closed-by-user":
      "The sign-in window was closed before sign-in finished. Please try again.",
    "auth/cancelled-popup-request":
      "The sign-in window was closed before sign-in finished. Please try again.",
    "auth/popup-blocked":
      "Your browser blocked the sign-in window. Allow pop-ups for Alfred and try again.",
    "auth/network-request-failed":
      "Alfred couldn't reach the internet. Check your connection and try again.",
    "auth/account-exists-with-different-credential":
      "This email already signs in another way. Try the other button.",
  }[code || ""]);

const container = {
  hidden: { opacity: 0, y: -10 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: -10 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

const Login = () => {
  const [user, isLoading] = useAuth();
  const [, setLocation] = useLocation();
  const toast = useToast();

  const onSignIn = (provider: AuthProvider) =>
    signIn(auth, provider).catch((error) =>
      toast({
        status: "error",
        title: "Couldn't sign you in",
        description: friendlyError(error.code) || error.code || error.message,
        isClosable: true,
      })
    );

  useEffect(() => {
    if (user) {
      setLocation("/", { replace: true });
    }
  }, [user]);

  return (
    <Box
      as={motion.div}
      sx={{
        minH: "100vh",
        "@supports (min-height: 100dvh)": { minH: "100dvh" },
        display: "flex",
        flexDirection: "column",
        px: 4,
        pt: "calc(var(--chakra-space-20) + env(safe-area-inset-top))",
        pb: "calc(var(--chakra-space-8) + env(safe-area-inset-bottom))",
        textAlign: "center",
      }}
      variants={container}
      initial="hidden"
      animate="show"
    >
      <Box sx={{ flex: 1 }}>
        <motion.div variants={item}>
          <Image src={Logo} alt="" sx={{ maxH: 24, mx: "auto" }} />
        </motion.div>
        <motion.div variants={item}>
          <Heading sx={{ mt: 6, fontSize: "5xl" }}>Alfred</Heading>
        </motion.div>
        <motion.div variants={item}>
          <Text sx={{ mt: 2, fontSize: "lg", color: "gray.600" }}>
            Your own wardrobe stylist
          </Text>
        </motion.div>
      </Box>

      {/* Sign-in sits at the bottom, within thumb reach */}
      <motion.div variants={item}>
        <Button
          sx={{
            width: "100%",
            borderRadius: "full",
            backgroundColor: "white",
            borderColor: "gray.300",
            color: "brand.800",
          }}
          size="lg"
          variant="outline"
          onClick={() => onSignIn(googleAuthProvider)}
          leftIcon={<Icon as={GoogleLogo} />}
        >
          Continue with Google
        </Button>
      </motion.div>
      <motion.div variants={item}>
        <Button
          sx={{ width: "100%", mt: 3, borderRadius: "full" }}
          size="lg"
          colorScheme="facebook"
          onClick={() => onSignIn(facebookAuthProvider)}
          leftIcon={<Icon as={FaFacebookSquare} />}
        >
          Continue with Facebook
        </Button>
      </motion.div>
      <motion.div variants={item}>
        <Text sx={{ mt: 4, fontSize: "sm", color: "gray.600" }}>
          New here? Signing in creates your account.
        </Text>
      </motion.div>

      {isLoading && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(251, 250, 246, 0.85)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="brand.500"
            size="xl"
          />
        </Box>
      )}
    </Box>
  );
};

export default Login;
