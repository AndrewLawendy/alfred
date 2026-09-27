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
  cancelText = "Cancel",
  okType = "brand",
  onCancel = () => false,
  onConfirm,
}: ConfirmProps) => {
  const confirmDrawerRef = useRef(null);
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
      >
        <DrawerOverlay />
        <DrawerContent bg="transparent" boxShadow="none">
          <Swipeable direction="down" onClose={cancel}>
            <Box sx={{ pt: 2, pb: 2 }}>
              <DrawerBody>{message}</DrawerBody>

              <DrawerFooter>
                <Button variant="outline" mr={3} onClick={cancel}>
                  {cancelText}
                </Button>
                <Button
                  colorScheme={okType}
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                >
                  {okText}
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
