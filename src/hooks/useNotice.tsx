import { Box, CloseButton, Flex, Icon, Text, useToast } from "@chakra-ui/react";
import { MdCheck, MdErrorOutline, MdInfoOutline } from "react-icons/md";

type Notice = {
  id?: string;
  status?: "success" | "error" | "info";
  title: string;
  description?: string;
};

const icons = {
  success: { as: MdCheck, color: "accent.300" },
  error: { as: MdErrorOutline, color: "red.200" },
  info: { as: MdInfoOutline, color: "gray.300" },
};

// Every short message in Alfred: an ink card at the top, like the update
// banner. Status shows only in the icon, never as a coloured fill.
const useNotice = () => {
  const toast = useToast();

  return ({ id, status = "info", title, description }: Notice) => {
    if (id && toast.isActive(id)) return;
    toast({
      id,
      position: "top",
      duration: 5000,
      render: ({ onClose }) => (
        <Flex
          // Chakra's toast list is already a polite live region; errors interrupt
          role={status === "error" ? "alert" : undefined}
          sx={{
            mt: "env(safe-area-inset-top)",
            gap: 3,
            p: 4,
            pr: 2,
            borderRadius: "card",
            backgroundColor: "brand.500",
            color: "card",
          }}
        >
          <Icon
            as={icons[status].as}
            sx={{
              w: 5,
              h: 5,
              mt: 0.5,
              flexShrink: 0,
              color: icons[status].color,
            }}
          />
          <Box sx={{ flex: 1 }}>
            <Text sx={{ fontWeight: "semibold" }}>{title}</Text>
            {description && (
              <Text sx={{ mt: 0.5, opacity: 0.8 }}>{description}</Text>
            )}
          </Box>
          <CloseButton aria-label="Close" onClick={onClose} sx={{ mt: -1 }} />
        </Flex>
      ),
    });
  };
};

export default useNotice;
