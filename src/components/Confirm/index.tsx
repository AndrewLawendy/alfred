import { useRef } from "react";
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerOverlay,
  DrawerContent,
  useDisclosure,
  ThemingProps,
} from "@chakra-ui/react";

type ChildrenProps = {
  onOpen: () => void;
};

type ConfirmProps = {
  children: (props: ChildrenProps) => React.ReactNode;
  message: string;
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
  okType = "blue",
  onCancel = () => false,
  onConfirm,
}: ConfirmProps) => {
  const confirmDrawerRef = useRef(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      {children({ onOpen })}
      <div ref={confirmDrawerRef} />
      <Drawer
        isOpen={isOpen}
        placement="bottom"
        onClose={() => {
          onCancel();
          onClose();
        }}
        portalProps={{ containerRef: confirmDrawerRef }}
      >
        <DrawerOverlay />
        <DrawerContent sx={{ pt: 4, pb: 2 }}>
          <DrawerBody>{message}</DrawerBody>

          <DrawerFooter>
            <Button
              variant="outline"
              mr={3}
              onClick={() => {
                onCancel();
                onClose();
              }}
            >
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
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Confirm;
