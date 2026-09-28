import { useRef } from "react";
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerOverlay,
  DrawerContent,
  useDisclosure,
  ThemingProps,
} from "@chakra-ui/react";
import Swipeable from "components/Swipeable";
import useBackToClose from "hooks/useBackToClose";

type ChildrenProps = {
  onOpen: () => void;
};

type ConfirmProps = {
  children: (props: ChildrenProps) => React.ReactNode;
  message: string | JSX.Element;
  okText?: string;
  cancelText?: string;
  okType?: ThemingProps<"Button">["colorScheme"];
  onCancel?: () => void;
  onConfirm: () => void;
};

const Confirm = ({
  children,
  message,
  okText = "Confirm",
  cancelText = "Keep it",
  okType = "brand",
  onCancel = () => false,
  onConfirm,
}: ConfirmProps) => {
  const confirmDrawerRef = useRef(null);
  const isConfirmed = useRef(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancel = () => {
    onCancel();
    onClose();
  };
  useBackToClose(isOpen, cancel);

  return (
    <>
      {children({ onOpen })}
      <div ref={confirmDrawerRef} />
      <Drawer
        isOpen={isOpen}
        placement="bottom"
        onClose={cancel}
        portalProps={{ containerRef: confirmDrawerRef }}
        // Act only once the sheet is gone and its history entry popped, so
        // an action that navigates (sign out, closing a screen) can't race
        // the sheet's own Back and overshoot the history
        onCloseComplete={() => {
          if (!isConfirmed.current) return;
          isConfirmed.current = false;
          onConfirm();
        }}
      >
        <DrawerOverlay />
        <DrawerContent bg="transparent" boxShadow="none">
          <Swipeable direction="down" onClose={cancel}>
            <Box sx={{ pt: 2, pb: 2 }}>
              <DrawerBody>{message}</DrawerBody>

              {/* The action on top, the way out right under it */}
              <DrawerFooter sx={{ flexDirection: "column", gap: 3 }}>
                <Button
                  colorScheme={okType}
                  size="lg"
                  sx={{ w: "100%" }}
                  onClick={() => {
                    isConfirmed.current = true;
                    onClose();
                  }}
                >
                  {okText}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={cancel}
                  sx={{ w: "100%" }}
                >
                  {cancelText}
                </Button>
              </DrawerFooter>
            </Box>
          </Swipeable>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Confirm;
