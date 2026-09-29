import { useEffect, useRef, useState } from "react";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Heading,
  Icon,
  Image,
  Text,
} from "@chakra-ui/react";
import { MdChevronRight } from "react-icons/md";

import Swipeable from "components/Swipeable";
import {
  layerDepth,
  replaceSearch,
  showScreenInPlace,
  useSearchParam,
} from "utils/history";
import { clearSharedPhoto, readSharedPhoto } from "utils/sharedPhoto";
import { Item } from "utils/types";

const types: { type: Item["type"]; label: string }[] = [
  { type: "shirt", label: "Shirt" },
  { type: "jacket", label: "Jacket" },
  { type: "belt", label: "Belt" },
  { type: "pants", label: "Pants" },
  { type: "shoes", label: "Shoes" },
];

// "What are you adding?" for the Add to wardrobe shortcut (?add=1) and for
// photos shared into Alfred (?add=1&shared=1). It's reached from outside the
// app, so it lives in the URL and is swapped out rather than stacked.
const AddChooser = () => {
  const isOpen = useSearchParam("add") === "1";
  const isShared = useSearchParam("shared") === "1";
  const [preview, setPreview] = useState<string>();
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!isOpen || !isShared) return;
    let url: string | undefined;
    readSharedPhoto().then((file) => {
      if (!file) return;
      url = URL.createObjectURL(file);
      setPreview(url);
    });
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [isOpen, isShared]);

  const onPick = (type: Item["type"]) =>
    showScreenInPlace(
      { kind: "new", type },
      `/wardrobe/${type}`,
      isShared ? { shared: "1" } : undefined
    );

  // On its own entry (opened from outside) closing is a Back to the page
  const onClose = () => {
    if (layerDepth() > 0) window.history.back();
    else replaceSearch("");
    clearSharedPhoto();
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      placement="bottom"
      initialFocusRef={titleRef}
    >
      <DrawerOverlay />
      <DrawerContent bg="transparent" boxShadow="none">
        <Swipeable direction="down" onClose={onClose}>
          <DrawerHeader>
            <Heading
              ref={titleRef}
              tabIndex={-1}
              sx={{ fontSize: "3xl", _focus: { outline: "none" } }}
            >
              What are you adding?
            </Heading>
          </DrawerHeader>
          <DrawerBody sx={{ pb: 6 }}>
            {preview && (
              <Image
                src={preview}
                alt=""
                sx={{
                  display: "block",
                  maxH: "30vh",
                  mx: "auto",
                  mb: 4,
                  borderRadius: "card",
                }}
              />
            )}
            {types.map(({ type, label }) => (
              <Flex
                key={type}
                as="button"
                onClick={() => onPick(type)}
                sx={{
                  w: "100%",
                  minH: 14,
                  mb: 2,
                  px: 4,
                  alignItems: "center",
                  borderRadius: "card",
                  backgroundColor: "card",
                  textAlign: "left",
                  transition: "transform 0.1s",
                  _active: { transform: "scale(0.98)" },
                }}
              >
                <Text sx={{ flex: 1, fontFamily: "heading", fontSize: "xl" }}>
                  {label}
                </Text>
                <Icon
                  as={MdChevronRight}
                  sx={{ w: 5, h: 5, color: "gray.600" }}
                />
              </Flex>
            ))}
          </DrawerBody>
        </Swipeable>
      </DrawerContent>
    </Drawer>
  );
};

export default AddChooser;
