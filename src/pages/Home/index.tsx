import { useMemo, useRef } from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  Text,
  Link,
  Icon,
  Image,
  useDisclosure,
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverArrow,
  PopoverHeader,
  PopoverBody,
} from "@chakra-ui/react";
import { GiSleevelessJacket } from "react-icons/gi";
import { HiSwitchVertical } from "react-icons/hi";
import {
  MdArrowForward,
  MdCheckroom,
  MdDryCleaning,
  MdRadioButtonChecked,
  MdRadioButtonUnchecked,
} from "react-icons/md";
import { orderBy } from "@firebase/firestore";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { Link as WouterLink } from "wouter";

import PageHeader from "components/PageHeader";
import Weather from "components/Weather";
import EmptyState from "components/EmptyState";
import Loading from "components/Loading";
import OutfitReference from "components/OutfitReference";
import Swipeable from "components/Swipeable";

import useAuth from "hooks/useAuth";
import useBackToClose from "hooks/useBackToClose";

import useData from "resources/useData";
import useUpdateDocument from "resources/useUpdateDocument";
import useWeather from "resources/useWeather";

import { openItem, openNewOutfit, openOutfit } from "utils/history";
import { nextOutfit } from "utils/rotation";
import { Item, Jacket, Outfit } from "utils/types";

const slots = ["shirt", "belt", "pants", "shoes"] as const;

const numbers = ["No", "One", "Two", "Three", "Four", "Five", "Six"];
const count = (n: number) => numbers[n] || String(n);

// e.g. "Mon 28 Sept"
const today = () =>
  new Date().toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

// Small label above a section, e.g. "UP NEXT"
const Eyebrow = ({ children }: { children: string }) => (
  <Text
    sx={{
      fontSize: "xs",
      fontWeight: "semibold",
      letterSpacing: "wider",
      textTransform: "uppercase",
      color: "gray.600",
    }}
  >
    {children}
  </Text>
);

const Swatch = ({ reference }: { reference: Outfit["shirt"] }) => {
  const [item] = useDocumentData(reference);
  return (
    <Box
      sx={{
        w: 9,
        h: 9,
        borderRadius: "md",
        overflow: "hidden",
        backgroundColor: "surface",
      }}
    >
      {item && (
        <Image
          src={(item as Item).imageUrl}
          alt=""
          sx={{ w: "100%", h: "100%", objectFit: "cover" }}
        />
      )}
    </Box>
  );
};

const Home = () => {
  const [user] = useAuth();
  const {
    isOpen: isSingleOutfitOpen,
    onClose: onSingleOutfitClose,
    onOpen: onSingleOutfitOpen,
  } = useDisclosure();
  const {
    isOpen: isJacketSheetOpen,
    onOpen: onJacketSheetOpen,
    onClose: onJacketSheetClose,
  } = useDisclosure();
  useBackToClose(isJacketSheetOpen, onJacketSheetClose);
  // Focus the title on open, so no focus ring lands on the first jacket
  const sheetTitleRef = useRef<HTMLElement>(null);
  const { data: weatherData, isLoading: isWeatherLoading } = useWeather();
  const [outfits, isOutfitsLoading] = useData<Outfit>(
    "outfits",
    orderBy("order")
  );
  const [updateOutfit, isUpdateOutfitLoading] =
    useUpdateDocument<Outfit>("outfits");
  const activeOutfit = useMemo(() => {
    const [firstOutfit] = outfits || [];
    return outfits?.find(({ active }) => active) || firstOutfit;
  }, [outfits]);
  const upNext =
    outfits && outfits.length > 1 ? nextOutfit(outfits, activeOutfit) : null;
  const [items] = useData<Item>("wardrobe-items");
  const jackets = useMemo(
    () =>
      (items || []).filter((item): item is Jacket => item.type === "jacket"),
    [items]
  );
  const temperatureJackets = useMemo(
    () =>
      weatherData
        ? jackets.filter(
            ({ maxTemperature }) => maxTemperature >= weatherData.main.temp
          )
        : [],
    [jackets, weatherData]
  );

  // Without any jackets we can't tell whether one is needed, so say nothing
  const verdict = !jackets.length
    ? undefined
    : temperatureJackets.length === 0
    ? "No jacket needed"
    : temperatureJackets.length === 1
    ? `Your ${temperatureJackets[0].title} would suit`
    : `${count(temperatureJackets.length)} jackets would suit`;

  // The chosen jacket, or the only one that suits
  const jacket =
    activeOutfit?.jacket ||
    (temperatureJackets.length === 1 ? temperatureJackets[0] : undefined);
  const hasJacketCard = Boolean(jacket || temperatureJackets.length > 1);

  const onFetchNextOutfit = () => {
    if (!outfits) return;

    if (outfits.length === 1) return onSingleOutfitOpen();

    const next = nextOutfit(outfits, activeOutfit);
    updateOutfit(next.id, { active: true });
    updateOutfit(activeOutfit.id, { active: false, jacket: null });
  };

  // Wear the next outfit today and push this one to right after it
  const onSwitchCurrentOutfit = () => {
    if (!outfits) return;

    if (outfits.length === 1) return onSingleOutfitOpen();

    const next = nextOutfit(outfits, activeOutfit);
    updateOutfit(next.id, { active: true, order: activeOutfit.order });
    updateOutfit(activeOutfit.id, {
      order: next.order,
      active: false,
      jacket: null,
    });
  };

  // Height taken by everything but the photos: date and greeting (114px),
  // weather card (68), action bar (64), plus the jacket card and up-next row
  const fixedHeight = 246 + (hasJacketCard ? 72 : 0) + (upNext ? 56 : 0);

  if (!user) return null;

  return (
    <>
      <PageHeader
        eyebrow={`Today · ${today()}`}
        title={`${greeting()}, ${user.displayName?.split(" ")[0]}.`}
      />
      <Box sx={{ mb: 3 }}>
        <Weather
          weatherData={weatherData}
          isLoading={isWeatherLoading}
          verdict={activeOutfit ? verdict : undefined}
        />
      </Box>

      {isOutfitsLoading ? (
        <Loading message="Laying out today's clothes" columns={2} />
      ) : activeOutfit ? (
        <>
          <Grid
            templateColumns="repeat(2, 1fr)"
            gap={2}
            // Chakra's sx drops custom properties, so set the variable directly
            style={
              {
                // Fit the whole outfit on screen: what's left after the rest
                // of the page and the nav, over two rows (8px gap, 10px frame
                // each); between 110px and the usual 162px
                "--outfit-photo-height": `clamp(110px, calc((100dvh - ${fixedHeight}px - env(safe-area-inset-top) - var(--chakra-space-nav)) / 2 - 14px), 162px)`,
              } as React.CSSProperties
            }
          >
            {slots.map((slot) => (
              <OutfitReference key={slot} reference={activeOutfit[slot]} />
            ))}
          </Grid>

          {hasJacketCard && (
            <Flex
              sx={{
                mt: 2,
                minH: 16,
                alignItems: "center",
                gap: 3,
                p: 2,
                borderRadius: "xl",
                border: "1px solid",
                borderColor: jacket ? "gray.200" : "accent.200",
                backgroundColor: "white",
              }}
            >
              {jacket ? (
                <Box
                  as="button"
                  onClick={() => openItem(jacket.id)}
                  aria-label={`Open ${jacket.title}`}
                  sx={{ flexShrink: 0 }}
                >
                  <Image
                    src={jacket.imageUrl}
                    alt=""
                    sx={{
                      w: 12,
                      h: 12,
                      borderRadius: "lg",
                      objectFit: "cover",
                    }}
                  />
                </Box>
              ) : (
                <Flex
                  sx={{
                    w: 12,
                    h: 12,
                    flexShrink: 0,
                    borderRadius: "lg",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "accent.50",
                    color: "accent.600",
                  }}
                >
                  <Icon as={GiSleevelessJacket} sx={{ w: 7, h: 7 }} />
                </Flex>
              )}
              <Box sx={{ flex: 1, minW: 0 }}>
                <Eyebrow>Today&apos;s jacket</Eyebrow>
                <Text noOfLines={1} sx={{ fontWeight: "medium" }}>
                  {jacket ? jacket.title : "Which one today?"}
                </Text>
              </Box>
              {temperatureJackets.length > 1 && (
                <Button
                  onClick={onJacketSheetOpen}
                  size="md"
                  {...(jacket
                    ? { variant: "ghost" }
                    : { colorScheme: "accent", bg: "accent.600" })}
                  sx={{ minH: "44px", px: 5, borderRadius: "full" }}
                >
                  {jacket ? "Change" : "Choose"}
                </Button>
              )}
            </Flex>
          )}

          {upNext && (
            <Flex
              as="button"
              onClick={() => openOutfit(upNext.id)}
              aria-label="Open the next outfit"
              sx={{
                mt: 2,
                w: "100%",
                minH: 12,
                alignItems: "center",
                gap: 3,
                px: 2,
                transition: "transform 0.1s",
                _active: { transform: "scale(0.98)" },
              }}
            >
              <Eyebrow>Up next</Eyebrow>
              <Flex sx={{ gap: 1.5 }}>
                {slots.map((slot) => (
                  <Swatch key={slot} reference={upNext[slot]} />
                ))}
              </Flex>
            </Flex>
          )}

          <Drawer
            isOpen={isJacketSheetOpen}
            onClose={onJacketSheetClose}
            placement="bottom"
            initialFocusRef={sheetTitleRef}
          >
            <DrawerOverlay />
            <DrawerContent bg="transparent" boxShadow="none">
              <Swipeable direction="down" onClose={onJacketSheetClose}>
                <DrawerHeader
                  ref={sheetTitleRef}
                  tabIndex={-1}
                  sx={{ pb: 1, _focus: { outline: "none" } }}
                >
                  Which jacket today?
                </DrawerHeader>
                <DrawerBody>
                  {weatherData && (
                    <Text sx={{ color: "gray.600", mb: 3 }}>
                      It&apos;s {Math.round(weatherData.main.temp)}° with{" "}
                      {weatherData.weather[0]?.description}. Each of these suits
                      the weather.
                    </Text>
                  )}
                  {temperatureJackets.map((option) => {
                    const isChosen = option.id === activeOutfit.jacket?.id;
                    return (
                      <Flex
                        key={option.id}
                        as="button"
                        role="radio"
                        aria-checked={isChosen}
                        onClick={() => {
                          updateOutfit(activeOutfit.id, { jacket: option });
                          onJacketSheetClose();
                        }}
                        sx={{
                          w: "100%",
                          alignItems: "center",
                          gap: 3,
                          p: 2,
                          mb: 2,
                          textAlign: "left",
                          borderRadius: "xl",
                          border: "2px solid",
                          borderColor: isChosen ? "accent.600" : "gray.200",
                          backgroundColor: "white",
                        }}
                      >
                        <Image
                          src={option.imageUrl}
                          alt=""
                          sx={{
                            w: 14,
                            h: 14,
                            borderRadius: "lg",
                            objectFit: "cover",
                          }}
                        />
                        <Box sx={{ flex: 1, minW: 0 }}>
                          <Text noOfLines={1} sx={{ fontWeight: "medium" }}>
                            {option.title}
                          </Text>
                          <Text sx={{ fontSize: "sm", color: "gray.600" }}>
                            For {option.maxTemperature}° or cooler
                          </Text>
                        </Box>
                        <Icon
                          as={
                            isChosen
                              ? MdRadioButtonChecked
                              : MdRadioButtonUnchecked
                          }
                          sx={{
                            w: 6,
                            h: 6,
                            color: isChosen ? "accent.600" : "gray.400",
                          }}
                        />
                      </Flex>
                    );
                  })}
                </DrawerBody>
                <DrawerFooter sx={{ pt: 0 }}>
                  <Button
                    variant="ghost"
                    onClick={onJacketSheetClose}
                    sx={{ w: "100%", borderRadius: "full" }}
                  >
                    {activeOutfit.jacket
                      ? `Keep the ${activeOutfit.jacket.title}`
                      : "Decide later"}
                  </Button>
                </DrawerFooter>
              </Swipeable>
            </DrawerContent>
          </Drawer>

          <Popover
            isOpen={isSingleOutfitOpen}
            onClose={onSingleOutfitClose}
            placement="top"
          >
            <PopoverAnchor>
              <Flex
                sx={{
                  // Sticky rather than fixed: it takes its own space after the
                  // outfit (never covering a photo) and stays above the nav
                  position: "sticky",
                  bottom: "nav",
                  mt: 4,
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Button
                  size="lg"
                  variant="outline"
                  colorScheme="brand"
                  backgroundColor="white"
                  leftIcon={<Icon as={HiSwitchVertical} />}
                  onClick={onSwitchCurrentOutfit}
                  isDisabled={isUpdateOutfitLoading}
                  sx={{ flex: 1, px: 4, fontSize: "md", borderRadius: "full" }}
                >
                  Swap with next
                </Button>

                <Button
                  size="lg"
                  colorScheme="brand"
                  rightIcon={<Icon as={MdArrowForward} />}
                  onClick={onFetchNextOutfit}
                  isLoading={isUpdateOutfitLoading}
                  sx={{
                    flex: 1,
                    px: 4,
                    fontSize: "md",
                    borderRadius: "full",
                    boxShadow: "material",
                  }}
                >
                  Next outfit
                </Button>
              </Flex>
            </PopoverAnchor>
            <PopoverContent>
              <PopoverHeader>Just one outfit so far</PopoverHeader>
              <PopoverBody>
                Alfred rotates between outfits, so there&apos;s nothing to move
                on to yet. Add another in{" "}
                <Link color="accent.600" as={WouterLink} to="/outfits">
                  Outfits
                </Link>
                .
              </PopoverBody>
              <PopoverArrow />
            </PopoverContent>
          </Popover>
        </>
      ) : (
        <EmptyState
          {...(items?.length
            ? {
                icon: MdDryCleaning,
                title: "Your wardrobe is in. Now, a first outfit.",
                description:
                  "Pick one shirt, one belt, one pair of pants and one pair of shoes. Alfred will add it to the rotation.",
                actionLabel: "Create an outfit",
                onAction: openNewOutfit,
              }
            : {
                icon: MdCheckroom,
                title: "Shall we begin with your wardrobe?",
                description:
                  "Photograph a few shirts, belts, pants and shoes. Once they're in, Alfred will lay out something to wear each morning.",
                actionLabel: "Open wardrobe",
                to: "/wardrobe",
              })}
        />
      )}
    </>
  );
};

export default Home;
