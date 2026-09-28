import { useEffect } from "react";
import { Button, Flex, Text, useToast } from "@chakra-ui/react";

// Installed PWAs are rarely fully closed, so a new version would otherwise wait
// indefinitely. Offer to switch to it as soon as it has been downloaded.
const UpdatePrompt = () => {
  const toast = useToast();

  useEffect(() => {
    const onUpdate = (event: Event) => {
      const { waiting } = (event as CustomEvent<ServiceWorkerRegistration>)
        .detail;
      if (!waiting || toast.isActive("sw-update")) return;

      const reload = () => {
        navigator.serviceWorker.addEventListener(
          "controllerchange",
          () => window.location.reload(),
          { once: true }
        );
        waiting.postMessage({ type: "SKIP_WAITING" });
      };

      toast({
        id: "sw-update",
        position: "top",
        duration: null,
        render: () => (
          <Flex
            sx={{
              alignItems: "center",
              gap: 3,
              pl: 5,
              pr: 3,
              py: 3,
              mt: "env(safe-area-inset-top)",
              borderRadius: "card",
              backgroundColor: "brand.500",
              color: "card",
            }}
          >
            <Text sx={{ flex: 1, fontSize: "sm" }}>
              A new version of Alfred is ready
            </Text>
            <Button
              size="sm"
              onClick={reload}
              sx={{ backgroundColor: "card", color: "brand.500" }}
            >
              Reload
            </Button>
          </Flex>
        ),
      });
    };

    window.addEventListener("sw-update", onUpdate);
    return () => window.removeEventListener("sw-update", onUpdate);
  }, []);

  return null;
};

export default UpdatePrompt;
