import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Heading,
  Image,
  Text,
} from "@chakra-ui/react";

import Swipeable from "components/Swipeable";
import useBackToClose from "hooks/useBackToClose";
import useNotice from "hooks/useNotice";
import useData from "resources/useData";
import useLimits from "resources/useLimits";
import useUpdateOutfits from "resources/useUpdateOutfits";
import { inHamper, limitOf, sinceLabel, washed } from "utils/laundry";
import { Item } from "utils/types";

type HamperSheetProps = { isOpen: boolean; onClose: () => void };

// What's waiting for a wash: clear it all, or piece by piece for a partial load
const HamperSheet = ({ isOpen, onClose }: HamperSheetProps) => {
  useBackToClose(isOpen, onClose);
  const [items] = useData<Item>("wardrobe-items");
  const limits = useLimits();
  const [updateOutfits, isSaving] = useUpdateOutfits();
  const toast = useNotice();
  const hamper = inHamper(items || [], limits);
  const save = (updates: ReturnType<typeof washed>[]) =>
    updateOutfits([], undefined, updates).catch(() =>
      toast({
        status: "error",
        title: "Couldn't update your hamper",
        description: "Nothing was changed. Please try again.",
      })
    );

  return (
    <Drawer isOpen={isOpen} onClose={onClose} placement="bottom">
      <DrawerOverlay />
      <DrawerContent bg="transparent" boxShadow="none">
        <Swipeable direction="down" onClose={onClose}>
          <DrawerHeader sx={{ pb: 2 }}>
            <Flex sx={{ alignItems: "center", gap: 3 }}>
              <Heading sx={{ flex: 1, fontSize: "3xl" }}>
                Hamper{hamper.length ? ` · ${hamper.length}` : ""}
              </Heading>
              {hamper.length > 0 && (
                <Button
                  colorScheme="brand"
                  isLoading={isSaving}
                  onClick={() => save(hamper.map(washed))}
                  // The header sets the serif; buttons stay in the body font
                  sx={{ fontFamily: "body" }}
                >
                  Laundry done
                </Button>
              )}
            </Flex>
          </DrawerHeader>
          <DrawerBody sx={{ pb: 8 }}>
            {hamper.length === 0 ? (
              <Text sx={{ color: "muted" }}>All clean 🧺</Text>
            ) : (
              hamper.map((item) => {
                const limit = limitOf(item, limits) ?? 1;
                return (
                  <Flex
                    key={item.id}
                    sx={{ alignItems: "center", gap: 3, py: 2 }}
                  >
                    <Image
                      src={item.imageUrl}
                      alt=""
                      sx={{
                        w: 12,
                        h: 12,
                        borderRadius: "thumb",
                        objectFit: "cover",
                      }}
                    />
                    <Box sx={{ flex: 1, minW: 0 }}>
                      <Text
                        noOfLines={1}
                        sx={{ fontFamily: "heading", fontSize: "lg" }}
                      >
                        {item.title}
                      </Text>
                      <Text sx={{ fontSize: "sm", color: "muted" }}>
                        {limit > 1 ? `${limit} of ${limit} · ` : ""}since{" "}
                        {sinceLabel(
                          "lastWornOn" in item ? item.lastWornOn : undefined
                        )}
                      </Text>
                    </Box>
                    <Button
                      variant="outline"
                      onClick={() => save([washed(item)])}
                    >
                      Washed
                    </Button>
                  </Flex>
                );
              })
            )}
          </DrawerBody>
        </Swipeable>
      </DrawerContent>
    </Drawer>
  );
};

export default HamperSheet;
