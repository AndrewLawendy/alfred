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

// Redirect breaks on localhost: browsers block the third-party storage it relies on
// https://firebase.google.com/docs/auth/web/redirect-best-practices
const signIn =
  process.env.NODE_ENV === "development" ? signInWithPopup : signInWithRedirect;

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
        // Firebase codes like auth/unauthorized-domain say what went wrong
        description: error.code || error.message,
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
      sx={{ py: 20, px: 3, textAlign: "center" }}
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item}>
        <Image src={Logo} sx={{ maxH: 28, mx: "auto" }} />
      </motion.div>
      <motion.div variants={item}>
        <Heading
          sx={{
            mt: 4,
          }}
        >
          Alfred
        </Heading>
      </motion.div>
      <motion.div variants={item}>
        <Text fontSize="xl">Your own wardrobe stylist</Text>
      </motion.div>

      <Box sx={{ mt: 32 }}>
        <motion.div variants={item}>
          <Text sx={{ fontSize: "lg", fontWeight: "semibold", mb: 4 }}>
            Login or create an account
          </Text>
        </motion.div>
        <motion.div variants={item}>
          <Button
            sx={{ width: "100%", boxShadow: "material" }}
            size="lg"
            colorScheme="facebook"
            onClick={() => onSignIn(facebookAuthProvider)}
            leftIcon={<Icon as={FaFacebookSquare} />}
          >
            Continue with Facebook
          </Button>
        </motion.div>
        <motion.div variants={item}>
          <Button
            sx={{ width: "100%", mt: 4, boxShadow: "material" }}
            size="lg"
            colorScheme="white"
            variant="outline"
            onClick={() => onSignIn(googleAuthProvider)}
            leftIcon={<Icon as={GoogleLogo} />}
          >
            Continue with Google
          </Button>
        </motion.div>
      </Box>

      {isLoading && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "whiteAlpha.800",
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
