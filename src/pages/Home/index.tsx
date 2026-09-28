import { useEffect, useMemo, useRef } from "react";
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
  Heading,
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
import { MdArrowForward, MdChevronRight } from "react-icons/md";
import { WiThermometer } from "react-icons/wi";
import { orderBy } from "@firebase/firestore";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { Link as WouterLink } from "wouter";

import PageHeader, { Eyebrow } from "components/PageHeader";
import { useInstallHint } from "components/Install";
import PickedMark, { pickedRing } from "components/PickedMark";
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

import { openNewOutfit, openOutfit, replaceSearch } from "utils/history";
import { jacketState } from "utils/jacket";
import { openItemFromPhoto } from "utils/photoTransition";
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

const Swatch = ({ reference }: { reference: Outfit["shirt"] }) => {
  const [item] = useDocumentData(reference);
  return (
    <Box
      sx={{
        w: 10,
        h: 10,
        borderRadius: "thumb",
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

// Outfit whose jacket prompt was shown; survives tab switches, resets on reload
let promptedFor: string | undefined;

// A near-white card on the stone page
const card = {
  alignItems: "center",
  gap: 3,
  p: 2,
  pr: 3,
  borderRadius: "card",
  backgroundColor: "card",
} as const;

// Measured heights (px) of everything on Home but the photos
const FIXED_HEIGHT = 240;
const CARD_HEIGHT = 72;

const Home = () => {
  const [user] = useAuth();
  useInstallHint();
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
  const sheetTitleRef = useRef<HTMLHeadingElement>(null);
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
  const chosen = activeOutfit?.jacket;
  const {
    suitable: temperatureJackets,
    options,
    jacket,
    isSkipped,
    hasCard: hasJacketCard,
    needsChoice,
  } = jacketState(jackets, weatherData?.main.temp, chosen);
  const needsJacketChoice = !!activeOutfit && needsChoice;

  // Without any jackets we can't tell whether one is needed, so say nothing
  const verdict = !jackets.length
    ? undefined
    : temperatureJackets.length === 0
    ? "No jacket needed"
    : temperatureJackets.length === 1
    ? `Your ${temperatureJackets[0].title} would suit`
    : `${count(temperatureJackets.length)} jackets would suit`;

  // Ask once per outfit when it becomes today's (on opening Home, Next or
  // Swap); primitive deps so Firestore refreshes don't reopen it
  useEffect(() => {
    if (needsJacketChoice && activeOutfit.id !== promptedFor) {
      promptedFor = activeOutfit.id;
      onJacketSheetOpen();
    }
  }, [needsJacketChoice, activeOutfit?.id]);

  const onPickJacket = (pick: Jacket | false) => {
    updateOutfit(activeOutfit.id, { jacket: pick });
    onJacketSheetClose();
  };

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

  // The "Next outfit" app shortcut opens /?action=next. Drop the parameter
  // first, so a reload can't move the rotation on a second time.
  const isShortcutNext = useRef(
    new URLSearchParams(window.location.search).get("action") === "next"
  );
  useEffect(() => {
    if (!isShortcutNext.current || !outfits) return;
    isShortcutNext.current = false;
    replaceSearch("");
    onFetchNextOutfit();
  }, [outfits]);

  // Height taken by everything but the photos: date and greeting, weather
  // card, action bar, plus the jacket card and up-next card when shown
  const fixedHeight =
    FIXED_HEIGHT +
    (hasJacketCard ? CARD_HEIGHT : 0) +
    (upNext ? CARD_HEIGHT : 0);

  if (!user) return null;

  return (
    <>
      <PageHeader
        eyebrow={`Today · ${today()}`}
        title={`${greeting()}, ${user.displayName?.split(" ")[0]}.`}
        titleSize="3xl"
      />
      <Box sx={{ mt: -2, mb: 3 }}>
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
                // of the page and the nav, over two rows (8px gap between);
                // between 110px and 190px
                "--outfit-photo-height": `clamp(110px, calc((100dvh - ${fixedHeight}px - env(safe-area-inset-top) - var(--chakra-space-nav)) / 2 - 4px), 190px)`,
              } as React.CSSProperties
            }
          >
            {slots.map((slot) => (
              <OutfitReference
                key={slot}
                reference={activeOutfit[slot]}
                isLabelled
              />
            ))}
          </Grid>

          {hasJacketCard && (
            <Flex sx={{ ...card, mt: 2, minH: 16 }}>
              {jacket ? (
                <Box
                  as="button"
                  onClick={(event: React.MouseEvent<HTMLElement>) =>
                    openItemFromPhoto(
                      jacket.id,
                      event.currentTarget.querySelector("img")
                    )
                  }
                  aria-label={`Open ${jacket.title}`}
                  sx={{ flexShrink: 0 }}
                >
                  <Image
                    src={jacket.imageUrl}
                    alt=""
                    data-photo-source={jacket.id}
                    sx={{
                      w: 12,
                      h: 12,
                      borderRadius: "thumb",
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
                    borderRadius: "thumb",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "surface",
                    color: "accent.600",
                  }}
                >
                  <Icon as={GiSleevelessJacket} sx={{ w: 7, h: 7 }} />
                </Flex>
              )}
              <Box sx={{ flex: 1, minW: 0 }}>
                <Eyebrow>Today&apos;s jacket</Eyebrow>
                <Text
                  noOfLines={1}
                  sx={{
                    fontFamily: "heading",
                    fontSize: "lg",
                    lineHeight: 1.3,
                  }}
                >
                  {jacket
                    ? jacket.title
                    : isSkipped
                    ? "No jacket today"
                    : "Which one today?"}
                </Text>
              </Box>
              <Button
                onClick={onJacketSheetOpen}
                {...(jacket || isSkipped
                  ? { variant: "outline" }
                  : { colorScheme: "brand" })}
              >
                {jacket || isSkipped ? "Change" : "Choose"}
              </Button>
            </Flex>
          )}

          {upNext && (
            <Flex
              as="button"
              onClick={() => openOutfit(upNext.id)}
              aria-label="Open the next outfit"
              sx={{
                ...card,
                mt: 2,
                w: "100%",
                minH: 16,
                pl: 4,
                textAlign: "left",
                transition: "transform 0.1s",
                _active: { transform: "scale(0.98)" },
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Eyebrow>Up next</Eyebrow>
                <Text
                  sx={{
                    fontFamily: "heading",
                    fontSize: "lg",
                    lineHeight: 1.3,
                  }}
                >
                  No. {(outfits?.indexOf(upNext) ?? 0) + 1}
                </Text>
              </Box>
              <Flex sx={{ gap: 1.5 }}>
                {slots.map((slot) => (
                  <Swatch key={slot} reference={upNext[slot]} />
                ))}
              </Flex>
              <Icon
                as={MdChevronRight}
                sx={{ w: 5, h: 5, color: "gray.600" }}
              />
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
                <DrawerHeader sx={{ pb: 2 }}>
                  {weatherData && (
                    <Flex
                      sx={{
                        alignItems: "center",
                        gap: 1,
                        color: "accent.600",
                        fontFamily: "body",
                        fontSize: "xs",
                        fontWeight: "semibold",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                      }}
                    >
                      <Icon as={WiThermometer} sx={{ w: 5, h: 5 }} />
                      {Math.round(weatherData.main.temp)}° ·{" "}
                      {weatherData.weather[0]?.description}
                    </Flex>
                  )}
                  <Heading
                    ref={sheetTitleRef}
                    tabIndex={-1}
                    sx={{ fontSize: "3xl", _focus: { outline: "none" } }}
                  >
                    Which jacket today?
                  </Heading>
                </DrawerHeader>
                <DrawerBody>
                  <Text sx={{ color: "gray.600", mb: 4 }}>
                    {temperatureJackets.length > 0
                      ? `${count(temperatureJackets.length)} of your jackets ${
                          temperatureJackets.length === 1 ? "suits" : "suit"
                        } the weather. `
                      : ""}
                    Alfred will remember your pick for this outfit.
                  </Text>
                  <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                    {options.map((option) => {
                      const isChosen = chosen ? option.id === chosen.id : false;
                      return (
                        <Box
                          key={option.id}
                          as="button"
                          aria-pressed={isChosen}
                          onClick={() => onPickJacket(option)}
                          sx={{ textAlign: "left", minW: 0 }}
                        >
                          <Box
                            sx={{
                              position: "relative",
                              aspectRatio: "4 / 5",
                              borderRadius: "card",
                              overflow: "hidden",
                              backgroundColor: "surface",
                              ...(isChosen && pickedRing),
                            }}
                          >
                            <Image
                              src={option.imageUrl}
                              alt=""
                              sx={{ w: "100%", h: "100%", objectFit: "cover" }}
                            />
                            {isChosen && <PickedMark />}
                          </Box>
                          <Text
                            noOfLines={1}
                            sx={{
                              pt: 2,
                              fontFamily: "heading",
                              fontSize: "lg",
                            }}
                          >
                            {option.title}
                          </Text>
                          <Text sx={{ fontSize: "sm", color: "gray.600" }}>
                            Up to {option.maxTemperature}°
                          </Text>
                        </Box>
                      );
                    })}
                  </Grid>
                </DrawerBody>
                <DrawerFooter sx={{ flexDirection: "column", gap: 2 }}>
                  <Button
                    size="lg"
                    aria-pressed={isSkipped}
                    onClick={() => onPickJacket(false)}
                    {...(isSkipped
                      ? { colorScheme: "brand" }
                      : { variant: "outline" })}
                    sx={{ w: "100%" }}
                  >
                    No jacket today
                  </Button>
                  {chosen == null && (
                    <Button
                      variant="ghost"
                      size="lg"
                      onClick={onJacketSheetClose}
                      sx={{ w: "100%" }}
                    >
                      Not now
                    </Button>
                  )}
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
                  leftIcon={<Icon as={HiSwitchVertical} />}
                  onClick={onSwitchCurrentOutfit}
                  isDisabled={isUpdateOutfitLoading}
                  sx={{ flex: 1, px: 4 }}
                >
                  Swap with next
                </Button>

                <Button
                  size="lg"
                  colorScheme="brand"
                  rightIcon={<Icon as={MdArrowForward} />}
                  onClick={onFetchNextOutfit}
                  isLoading={isUpdateOutfitLoading}
                  sx={{ flex: 1, px: 4 }}
                >
                  Next outfit
                </Button>
              </Flex>
            </PopoverAnchor>
            <PopoverContent sx={{ borderRadius: "card", bg: "card" }}>
              <PopoverHeader sx={{ fontWeight: "semibold" }}>
                Just one outfit so far
              </PopoverHeader>
              <PopoverBody>
                Alfred rotates between outfits, so there&apos;s nothing to move
                on to yet. Add another in{" "}
                <Link color="accent.600" as={WouterLink} to="/outfits">
                  Outfits
                </Link>
                .
              </PopoverBody>
              <PopoverArrow sx={{ bg: "card" }} />
            </PopoverContent>
          </Popover>
        </>
      ) : (
        <EmptyState
          {...(items?.length
            ? {
                title: "Your wardrobe is in. Now, a first outfit.",
                description:
                  "Pick one shirt, one belt, one pair of pants and one pair of shoes. Alfred will add it to the rotation.",
                actionLabel: "Create an outfit",
                onAction: openNewOutfit,
              }
            : {
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
