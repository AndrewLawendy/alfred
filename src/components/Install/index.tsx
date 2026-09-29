import { useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Text,
  useToast,
} from "@chakra-ui/react";
import { MdIosShare } from "react-icons/md";
import { TbDeviceMobile } from "react-icons/tb";

import { install, isInstalled, isIOS, useInstallPrompt } from "utils/pwa";

const SEEN_KEY = "alfred-install-hint-seen";

// What to tell someone who hasn't installed Alfred yet, or null when there's
// nothing to offer (already installed, or a browser that can't install)
const useInstallOffer = () => {
  const prompt = useInstallPrompt();
  if (isInstalled()) return null;
  if (prompt) return "prompt" as const;
  if (isIOS()) return "ios" as const;
  return null;
};

const IosSteps = () => (
  <Text sx={{ color: "gray.600" }}>
    Tap{" "}
    <Icon as={MdIosShare} aria-label="Share" sx={{ verticalAlign: "-2px" }} />{" "}
    Share, then <b>Add to Home Screen</b>.
  </Text>
);

// Account: always there until Alfred is installed
export const InstallCard = () => {
  const offer = useInstallOffer();
  if (!offer) return null;

  return (
    <Flex
      sx={{
        mt: 5,
        gap: 3,
        p: 4,
        borderRadius: "card",
        backgroundColor: "card",
      }}
    >
      <Icon
        as={TbDeviceMobile}
        sx={{ w: 6, h: 6, flexShrink: 0, color: "accent.500" }}
      />
      <Box sx={{ flex: 1 }}>
        <Heading sx={{ fontSize: "xl" }}>Install Alfred</Heading>
        <Text sx={{ mt: 1, mb: 3, color: "gray.600" }}>
          Full screen, quicker to open, and your outfits work offline.
        </Text>
        {offer === "prompt" ? (
          <Button colorScheme="brand" onClick={install}>
            Install
          </Button>
        ) : (
          <IosSteps />
        )}
      </Box>
    </Flex>
  );
};

// Today: a one-time hint per device, a few seconds after opening in a tab
export const useInstallHint = () => {
  const offer = useInstallOffer();
  const toast = useToast();

  useEffect(() => {
    let isSeen = true;
    try {
      isSeen = localStorage.getItem(SEEN_KEY) === "1";
    } catch {
      // Private mode or blocked storage: skip the hint rather than repeat it
    }
    if (!offer || isSeen) return;

    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(SEEN_KEY, "1");
      } catch {
        // Nothing to remember it in; it may show again next time
      }
      toast({
        id: "install",
        position: "top",
        duration: 12000,
        render: (toastProps) => (
          <Box
            sx={{
              mt: "env(safe-area-inset-top)",
              p: 4,
              borderRadius: "card",
              backgroundColor: "brand.500",
              color: "card",
            }}
          >
            <Text sx={{ fontWeight: "semibold" }}>
              Alfred works best installed
            </Text>
            {offer === "prompt" ? (
              <Flex sx={{ mt: 3, gap: 2 }}>
                <Button
                  onClick={() => {
                    toastProps.onClose();
                    // Dismissing the browser's own prompt rejects: nothing to do
                    install().catch(() => undefined);
                  }}
                  sx={{ bg: "card", color: "brand.500" }}
                >
                  Install
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => toastProps.onClose()}
                  sx={{ color: "card", _hover: { bg: "whiteAlpha.200" } }}
                >
                  Not now
                </Button>
              </Flex>
            ) : (
              <Flex sx={{ mt: 1, alignItems: "center", gap: 3 }}>
                <Text sx={{ flex: 1, opacity: 0.85 }}>
                  Tap Share, then Add to Home Screen.
                </Text>
                <Button
                  variant="ghost"
                  onClick={() => toastProps.onClose()}
                  sx={{ color: "card", _hover: { bg: "whiteAlpha.200" } }}
                >
                  OK
                </Button>
              </Flex>
            )}
          </Box>
        ),
      });
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [offer]);
};
