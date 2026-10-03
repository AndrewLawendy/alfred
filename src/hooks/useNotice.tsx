import {
  Box,
  Button,
  CloseButton,
  Flex,
  Icon,
  Text,
  useToast,
} from "@chakra-ui/react";
import { MdCheck, MdErrorOutline, MdInfoOutline } from "react-icons/md";

export type Notice = {
  id?: string;
  status?: "success" | "error" | "info";
  title: string;
  description?: string;
  // A button beside the message, e.g. Undo; it closes the notice too
  action?: { label: string; onClick: () => void };
};

// Long enough to reach the action (Undo) even when a sheet opens over the page
export const noticeDuration = ({ action }: Notice) => (action ? 10000 : 5000);

const icons = {
  success: { as: MdCheck, color: "noticeSuccess" },
  error: { as: MdErrorOutline, color: "noticeError" },
  info: { as: MdInfoOutline, color: "onInkMuted" },
};

// Every short message in Alfred: an ink card at the top, like the update
// banner. Status shows only in the icon, never as a coloured fill.
const useNotice = () => {
  const toast = useToast();

  return ({ id, status = "info", title, description, action }: Notice) => {
    if (id && toast.isActive(id)) return;
    toast({
      id,
      position: "top",
      duration: noticeDuration({ title, action }),
      render: (toastProps) => (
        <Flex
          // Chakra's toast list is already a polite live region; errors interrupt
          role={status === "error" ? "alert" : undefined}
          sx={{
            mt: "env(safe-area-inset-top)",
            gap: 3,
            p: 4,
            pr: 2,
            borderRadius: "card",
            backgroundColor: "ink",
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
          {action && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                action.onClick();
                toastProps.onClose();
              }}
              sx={{ color: "card", alignSelf: "center" }}
            >
              {action.label}
            </Button>
          )}
          <CloseButton
            aria-label="Close"
            onClick={() => toastProps.onClose()}
            sx={{ mt: -1 }}
          />
        </Flex>
      ),
    });
  };
};

export default useNotice;
