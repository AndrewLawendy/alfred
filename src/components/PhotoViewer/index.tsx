import { useRef } from "react";
import {
  Icon,
  IconButton,
  Image,
  Modal,
  ModalContent,
  ModalOverlay,
} from "@chakra-ui/react";
import { MdClose } from "react-icons/md";

import useBackToClose from "hooks/useBackToClose";

type PhotoViewerProps = {
  photoUrl: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
};

// A photo shown whole and uncropped, full screen; tap, ✕ or Back closes it
const PhotoViewer = ({
  photoUrl,
  title,
  isOpen,
  onClose,
}: PhotoViewerProps) => {
  useBackToClose(isOpen, onClose);
  const photoRef = useRef<HTMLImageElement>(null);
  return (
    // Focus lands on the photo, so no ring on ✕ is the first thing seen
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      initialFocusRef={photoRef}
    >
      <ModalOverlay sx={{ backgroundColor: "blackAlpha.900" }} />
      <ModalContent
        onClick={onClose}
        sx={{
          m: 0,
          backgroundColor: "transparent",
          boxShadow: "none",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <IconButton
          aria-label="Close"
          icon={<Icon as={MdClose} sx={{ w: 6, h: 6 }} />}
          onClick={onClose}
          variant="ghost"
          sx={{
            position: "absolute",
            top: "calc(var(--chakra-space-3) + env(safe-area-inset-top))",
            right: 3,
            color: "white",
            borderRadius: "full",
          }}
        />
        <Image
          ref={photoRef}
          tabIndex={-1}
          src={photoUrl}
          alt={title}
          sx={{
            maxW: "100%",
            maxH: "100dvh",
            objectFit: "contain",
            _focus: { outline: "none" },
          }}
        />
      </ModalContent>
    </Modal>
  );
};

export default PhotoViewer;
