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
              pl: 4,
              pr: 2,
              py: 2,
              mt: "env(safe-area-inset-top)",
              borderRadius: "full",
              backgroundColor: "brand.500",
              color: "white",
              boxShadow: "lg",
            }}
          >
            <Text sx={{ flex: 1, fontSize: "sm" }}>
              A new version of Alfred is ready
            </Text>
            <Button
              size="sm"
              onClick={reload}
              sx={{
                borderRadius: "full",
                backgroundColor: "accent.300",
                color: "brand.800",
              }}
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
