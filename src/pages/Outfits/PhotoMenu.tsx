import {
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import {
  MdDelete,
  MdFullscreen,
  MdPhotoCamera,
  MdPhotoLibrary,
} from "react-icons/md";

import usePhotoFiles from "hooks/usePhotoFiles";

type PhotoMenuProps = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onPick: (file: File) => void;
  onView: () => void;
  onRemove: () => void;
};

// The camera button on the editor's photo: replace it, see it, or remove it.
// Tapping the photo opens the same menu (the parent owns `isOpen`).
const PhotoMenu = ({
  isOpen,
  onOpen,
  onClose,
  onPick,
  onView,
  onRemove,
}: PhotoMenuProps) => {
  const { take, choose, inputs } = usePhotoFiles(onPick);
  return (
    <>
      {inputs}
      <Menu
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
        placement="bottom-start"
      >
        <MenuButton
          as={IconButton}
          aria-label="Photo options"
          icon={<Icon as={MdPhotoCamera} sx={{ w: 5, h: 5 }} />}
          sx={{
            minW: "44px",
            w: "44px",
            h: "44px",
            borderRadius: "full",
            backgroundColor: "card",
            color: "accentText",
            boxShadow: "md",
          }}
        />
        <MenuList>
          <MenuItem icon={<Icon as={MdPhotoCamera} />} onClick={take}>
            Take photo
          </MenuItem>
          <MenuItem icon={<Icon as={MdPhotoLibrary} />} onClick={choose}>
            Choose from library
          </MenuItem>
          <MenuItem icon={<Icon as={MdFullscreen} />} onClick={onView}>
            View full screen
          </MenuItem>
          <MenuItem
            icon={<Icon as={MdDelete} />}
            onClick={onRemove}
            sx={{ color: "dangerText" }}
          >
            Remove photo
          </MenuItem>
        </MenuList>
      </Menu>
    </>
  );
};

export default PhotoMenu;
