import { useRef } from "react";
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Heading,
  Image,
  Text,
} from "@chakra-ui/react";

import { Eyebrow } from "components/PageHeader";
import Swipeable from "components/Swipeable";
import useBackToClose from "hooks/useBackToClose";
import useNotice from "hooks/useNotice";
import useWardrobe from "resources/useWardrobe";
import useLimits from "resources/useLimits";
import useUpdateOutfits from "resources/useUpdateOutfits";
import useLaundryDone from "resources/useLaundryDone";
import {
  hamperGroups,
  inHamper,
  limitOf,
  sinceLabel,
  washed,
} from "utils/laundry";
import { CATEGORIES } from "utils/wardrobe";
import { Category } from "utils/types";

type HamperSheetProps = { isOpen: boolean; onClose: () => void };

const groupLabel = (type: Category) =>
  CATEGORIES.find(({ key }) => key === type)?.plural ?? type;

// What's waiting for a wash, by type: clear it all, a type at a time, or
// piece by piece for a partial load
const HamperSheet = ({ isOpen, onClose }: HamperSheetProps) => {
  useBackToClose(isOpen, onClose);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [items] = useWardrobe();
  const limits = useLimits();
  const [updateOutfits, isSaving] = useUpdateOutfits();
  const toast = useNotice();
  const laundryDone = useLaundryDone();
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
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      placement="bottom"
      // Focus the title on open, so no focus ring lands on the first button
      initialFocusRef={titleRef}
    >
      <DrawerOverlay />
      <DrawerContent bg="transparent" boxShadow="none">
        <Swipeable direction="down" onClose={onClose} isHandleOnly>
          <DrawerHeader
            sx={{
              pt: 1,
              pb: 2,
              display: "flex",
              alignItems: "baseline",
              gap: 2,
            }}
          >
            <Heading
              ref={titleRef}
              tabIndex={-1}
              sx={{ fontSize: "3xl", _focus: { outline: "none" } }}
            >
              Hamper
            </Heading>
            {hamper.length > 0 && (
              <Text sx={{ fontFamily: "body", fontSize: "md", color: "muted" }}>
                {hamper.length} piece{hamper.length === 1 ? "" : "s"}
              </Text>
            )}
          </DrawerHeader>
          <DrawerBody sx={{ pb: 4 }}>
            {hamper.length === 0 ? (
              <Text sx={{ color: "muted", pb: 6 }}>All clean 🧺</Text>
            ) : (
              hamperGroups(hamper).map(({ type, pieces }) => (
                <Box key={type} sx={{ mb: 3 }}>
                  <Flex
                    sx={{
                      mt: 2,
                      mb: 1,
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Eyebrow>
                      {groupLabel(type)} · {pieces.length}
                    </Eyebrow>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => save(pieces.map(washed))}
                      sx={{ color: "accentText" }}
                    >
                      Wash all {groupLabel(type).toLowerCase()}
                    </Button>
                  </Flex>
                  {pieces.map((item) => {
                    const limit = limitOf(item, limits) ?? 1;
                    return (
                      <Flex
                        key={item.id}
                        sx={{
                          alignItems: "center",
                          gap: 3,
                          py: 2,
                          borderBottom: "1px solid",
                          borderColor: "line",
                        }}
                      >
                        <Image
                          src={item.imageUrl}
                          alt=""
                          sx={{
                            w: 12,
                            h: 12,
                            flexShrink: 0,
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
                          size="sm"
                          variant="outline"
                          onClick={() => save([washed(item)])}
                        >
                          Washed
                        </Button>
                      </Flex>
                    );
                  })}
                </Box>
              ))
            )}
          </DrawerBody>
          {hamper.length > 0 && (
            // Pinned: a long hamper scrolls, Laundry done stays in reach
            <DrawerFooter sx={{ borderTop: "1px solid", borderColor: "line" }}>
              <Button
                size="lg"
                colorScheme="brand"
                isLoading={isSaving}
                onClick={() => laundryDone(hamper)}
                sx={{ w: "100%" }}
              >
                Laundry done · {hamper.length}
              </Button>
            </DrawerFooter>
          )}
        </Swipeable>
      </DrawerContent>
    </Drawer>
  );
};

export default HamperSheet;
