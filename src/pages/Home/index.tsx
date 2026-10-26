import { useEffect, useMemo, useRef, useState } from "react";
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
  Icon,
  Image,
  useDisclosure,
} from "@chakra-ui/react";
import { GiSleevelessJacket } from "react-icons/gi";
import { MdCheck } from "react-icons/md";
import { WiThermometer } from "react-icons/wi";

import PageHeader, { Eyebrow } from "components/PageHeader";
import { useInstallHint } from "components/Install";
import PickedMark, { pickedRing } from "components/PickedMark";
import Weather from "components/Weather";
import EmptyState from "components/EmptyState";
import HamperSheet from "components/HamperSheet";
import Loading from "components/Loading";
import OutfitLayout from "components/OutfitLayout";
import Swipeable from "components/Swipeable";
import ChooseSheet from "pages/Home/ChooseSheet";
import OutfitCard from "pages/Home/OutfitCard";

import useAuth from "hooks/useAuth";
import useBackToClose from "hooks/useBackToClose";
import useNotice from "hooks/useNotice";
import useToday from "hooks/useToday";
import useLaundryDone from "resources/useLaundryDone";

import useOutfits from "resources/useOutfits";
import useWardrobe from "resources/useWardrobe";
import useUpdateDocument from "resources/useUpdateDocument";
import useUpdateOutfits from "resources/useUpdateOutfits";
import type { OutfitUpdate } from "resources/useUpdateOutfits";
import useWeather from "resources/useWeather";
import { useLimitsState } from "resources/useLimits";

import { openNewOutfit, openOutfit } from "utils/history";
import { jacketState } from "utils/jacket";
import { openItemFromPhoto } from "utils/photoTransition";
import {
  byId,
  cleanCount,
  hamperPieces,
  inHamper,
  isOnScreen,
  sinceLabel,
  surpriseCandidates,
  undoOf,
  stripOf,
  washed,
  wearBadge,
  wearToday,
} from "utils/laundry";
import type { ItemUpdate } from "utils/laundry";
import { outfitTitle, pieceIdsOf } from "utils/wardrobe";
import { Jacket, Outfit } from "utils/types";

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

// Outfit whose jacket prompt was shown; survives tab switches, resets on reload
let promptedFor: string | undefined;

// "Not yet" on the laundry banner hides it on this device until tomorrow
const LAUNDRY_NOT_YET_KEY = "alfred-laundry-not-yet";
const laundryNotYetOn = () => {
  try {
    return localStorage.getItem(LAUNDRY_NOT_YET_KEY);
  } catch {
    return null;
  }
};

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
const STRIP_HEIGHT = 80;

const Home = () => {
  const [user] = useAuth();
  useInstallHint();
  const {
    isOpen: isJacketSheetOpen,
    onOpen: onJacketSheetOpen,
    onClose: onJacketSheetClose,
  } = useDisclosure();
  useBackToClose(isJacketSheetOpen, onJacketSheetClose);
  const {
    isOpen: isHamperOpen,
    onOpen: onHamperOpen,
    onClose: onHamperClose,
  } = useDisclosure();
  const {
    isOpen: isChooseOpen,
    onOpen: onChooseOpen,
    onClose: onChooseClose,
  } = useDisclosure();
  // Focus the title on open, so no focus ring lands on the first jacket
  const sheetTitleRef = useRef<HTMLHeadingElement>(null);
  const { data: weatherData, isLoading: isWeatherLoading } = useWeather();
  const [outfits, isOutfitsLoading] = useOutfits();
  const [updateOutfit, isUpdateOutfitLoading] =
    useUpdateDocument<Outfit>("outfits");
  const [updateOutfits, isUpdateOutfitsLoading] = useUpdateOutfits();
  const activeOutfit = useMemo(() => {
    const [firstOutfit] = outfits || [];
    return outfits?.find(({ active }) => active) || firstOutfit;
  }, [outfits]);
  const [items, isItemsLoading] = useWardrobe();
  const { limits, isLoading: isLimitsLoading } = useLimitsState();
  // Counting waits for the wardrobe and the person's own limits
  const isCountReady = !!items && !isLimitsLoading;
  const itemsById = useMemo(() => byId(items || []), [items]);
  const date = useToday();
  const isPickedToday = activeOutfit?.pickedOn === date;
  // Nothing worn yet: today's outfit has never come up on a day
  const isFirstUse = !!activeOutfit && !activeOutfit.pickedOn;
  const strip = outfits
    ? stripOf({ outfits, items: itemsById, limits, isPicked: isPickedToday })
    : { upcoming: [] };
  // What the big card shows until a strip card is tapped: Up next in the
  // morning, otherwise today's outfit
  const defaultShown = strip.last ? strip.upcoming[0] : activeOutfit;
  // Tapping a strip card only previews it; Wear or Switch writes. A preview
  // of a deleted outfit falls back to the default.
  const [previewId, setPreviewId] = useState<string>();
  const shown = outfits?.find(({ id }) => id === previewId) ?? defaultShown;
  const isShowingToday = shown?.id === activeOutfit?.id;
  const numberOf = (outfit: Outfit) => (outfits?.indexOf(outfit) ?? 0) + 1;
  const activePieces = shown
    ? pieceIdsOf(shown).flatMap((id) => itemsById.get(id) ?? [])
    : [];
  const blocked = shown ? hamperPieces(shown, itemsById, limits) : [];
  const hamper = inHamper(items || [], limits);
  const clean = outfits ? cleanCount(outfits, itemsById, limits) : 0;
  // The day "Not yet" was tapped: it hides the banner until the date moves on
  const [laundryNotYetDay, setLaundryNotYetDay] = useState(laundryNotYetOn);
  const showLaundry =
    hamper.length > 0 && clean <= 2 && laundryNotYetDay !== date;
  const shownLabel = !shown
    ? ""
    : isFirstUse && isShowingToday
      ? "Your first outfit"
      : isPickedToday && isShowingToday
        ? `Today · ${sinceLabel(date, date)}`
        : shown === strip.last
          ? `Last worn · ${sinceLabel(shown.pickedOn, date)}`
          : strip.last && shown === strip.upcoming[0]
            ? "Up next"
            : "Preview";
  const jackets = useMemo(
    () =>
      (items || []).filter((item): item is Jacket => item.type === "outerwear"),
    [items]
  );
  // The outfit keeps a copy of today's jacket: show the jacket as it is now
  // (renamed, new photo), and ask again if it was deleted. Until the wardrobe
  // loads, the copy stands in, so the prompt doesn't open early.
  const saved = activeOutfit?.jacket;
  const chosen =
    saved && items
      ? (jackets.find(({ id }) => id === saved.id) ?? null)
      : saved;
  const {
    suitable: temperatureJackets,
    options,
    jacket,
    isSkipped,
    hasCard,
    needsChoice,
  } = jacketState(jackets, weatherData?.main.temp, chosen);
  // Held back while the weather loads, so it can't show and then vanish
  const hasJacketCard = hasCard && !isWeatherLoading;
  const needsJacketChoice = !!activeOutfit && needsChoice;

  // Without any jackets we can't tell whether one is needed, so say nothing
  const verdict = !jackets.length
    ? undefined
    : temperatureJackets.length === 0
      ? "No jacket needed"
      : temperatureJackets.length === 1
        ? `Your ${temperatureJackets[0].title} would suit`
        : `${count(temperatureJackets.length)} jackets would suit`;

  // Ask once per outfit when it becomes today's (on opening Home, Next
  // outfit or Wear today); primitive deps so Firestore refreshes don't reopen it
  useEffect(() => {
    if (needsJacketChoice && activeOutfit.id !== promptedFor) {
      promptedFor = activeOutfit.id;
      onJacketSheetOpen();
    }
  }, [needsJacketChoice, activeOutfit?.id]);

  // Offline, changes queue and count as done; this is a change the server
  // turned down
  const toast = useNotice();
  const laundryDone = useLaundryDone();
  const onWriteError = () =>
    toast({
      status: "error",
      title: "Couldn't update your outfits",
      description: "Nothing was changed. Please try again.",
    });

  const onPickJacket = (pick: Jacket | false) => {
    updateOutfit(activeOutfit.id, { jacket: pick }).catch(onWriteError);
    onJacketSheetClose();
  };

  // The latest outfits, for an Undo tapped after the list has changed
  const latestOutfits = useRef(outfits);
  useEffect(() => {
    latestOutfits.current = outfits;
  });

  // Writes a move, then offers Undo while the outfit it brought up is still
  // today's
  const commitMove = (
    result: { outfits: OutfitUpdate[]; items: ItemUpdate[] },
    title: string
  ) => {
    if (!outfits || !items) return;
    // The outfit this move brings on screen (the same one if it stays)
    const broughtUp =
      result.outfits.find(({ changes }) => changes.active)?.id ??
      activeOutfit.id;
    const undo = {
      outfits: undoOf(outfits, result.outfits),
      items: undoOf(items, result.items),
    };
    updateOutfits(result.outfits, undefined, result.items)
      .then(() =>
        toast({
          status: "success",
          title,
          action: {
            label: "Undo",
            onClick: () => {
              // After another move (or Wear today), undoing would
              // leave two outfits marked as today's
              if (!isOnScreen(latestOutfits.current || [], broughtUp)) {
                toast({
                  title: "Can't undo now",
                  description: "Today's outfit has changed since.",
                });
                return;
              }
              updateOutfits(undo.outfits, undefined, undo.items).catch(
                onWriteError
              );
            },
          },
        })
      )
      .catch(onWriteError);
  };

  // Wear (morning or first use) and Switch (once picked) the outfit shown.
  // In the morning today's outfit is counted first; on first use it was
  // never worn, and once picked it already counts, so neither counts.
  const onWear = () => {
    if (!outfits || !items || !isCountReady || !shown) return;
    setPreviewId(undefined);
    const number = numberOf(shown);
    if (isFirstUse && isShowingToday) {
      commitMove(
        { outfits: [{ id: shown.id, changes: { pickedOn: date } }], items: [] },
        `No. ${number} is today's`
      );
      return;
    }
    const countCurrent = !isFirstUse && !isPickedToday;
    const result = wearToday({
      outfits,
      items: itemsById,
      limits,
      date,
      to: shown.id,
      countCurrent,
    });
    if (!result.outfits.length) return;
    commitMove(
      result,
      countCurrent
        ? `Counted outfit No. ${numberOf(activeOutfit)}`
        : `No. ${number} is today's`
    );
  };

  // All: an outfit picked in the sheet (or by Surprise me) is previewed, like
  // a strip card; Wear or Switch writes
  const onChoose = (id: string) => {
    onChooseClose();
    setPreviewId(id === defaultShown?.id ? undefined : id);
  };

  // The clean outfits the sheet offers; also worked out while it's closed, so
  // nothing dims as it slides away
  const candidates = outfits
    ? surpriseCandidates({
        outfits,
        items: itemsById,
        limits,
        isPicked: isPickedToday,
      })
    : [];

  // Height taken by everything but the photos: date and greeting, weather
  // card, outfit label, action bar, plus the laundry, hamper, jacket and
  // up-next cards when shown
  const fixedHeight =
    FIXED_HEIGHT +
    24 +
    (showLaundry ? CARD_HEIGHT : 0) +
    (blocked.length > 0 ? CARD_HEIGHT : 0) +
    (hasJacketCard && isShowingToday ? CARD_HEIGHT : 0) +
    (strip.upcoming.length > 0 ? STRIP_HEIGHT : 0);

  if (!user) return null;

  return (
    <>
      <PageHeader
        eyebrow={`Today · ${today()}`}
        title={
          user.displayName
            ? `${greeting()}, ${user.displayName.split(" ")[0]}.`
            : `${greeting()}.`
        }
        titleSize="3xl"
      />
      <Box sx={{ mt: -2, mb: 3 }}>
        <Weather
          weatherData={weatherData}
          isLoading={isWeatherLoading}
          verdict={activeOutfit ? verdict : undefined}
        />
      </Box>

      {isOutfitsLoading || isItemsLoading ? (
        <Loading message="Laying out today's clothes" columns={2} />
      ) : activeOutfit && shown ? (
        <>
          {showLaundry && (
            <Flex
              sx={{
                ...card,
                mb: 2,
                p: 4,
                flexDirection: "column",
                alignItems: "stretch",
              }}
            >
              <Text
                as="button"
                onClick={onHamperOpen}
                sx={{ fontWeight: "semibold", textAlign: "left" }}
              >
                {clean === 0
                  ? "Laundry day — nothing's fully clean"
                  : `Only ${clean} clean outfit${clean === 1 ? "" : "s"} left. Did you do laundry?`}
              </Text>
              <Flex sx={{ mt: 3, gap: 2 }}>
                <Button
                  variant="outline"
                  onClick={() => {
                    setLaundryNotYetDay(date);
                    try {
                      localStorage.setItem(LAUNDRY_NOT_YET_KEY, date);
                    } catch {
                      // Shown again after a reload; nothing lost
                    }
                  }}
                  sx={{ flex: 1 }}
                >
                  Not yet
                </Button>
                <Button
                  colorScheme="brand"
                  onClick={() => laundryDone(hamper)}
                  sx={{ flex: 1 }}
                >
                  Yes, reset all
                </Button>
              </Flex>
            </Flex>
          )}

          {blocked.length > 0 && (
            <Flex
              sx={{
                ...card,
                mb: 2,
                p: 4,
                flexDirection: "column",
                alignItems: "stretch",
              }}
            >
              <Text
                as="button"
                onClick={onHamperOpen}
                sx={{ textAlign: "left" }}
              >
                🧺 {blocked.map(({ title }) => title).join(" and ")}{" "}
                {blocked.length === 1
                  ? `is in the laundry basket since ${sinceLabel("lastWornOn" in blocked[0] ? blocked[0].lastWornOn : undefined, date)}`
                  : "are in the laundry basket"}
                . Clean now?
              </Text>
              <Button
                colorScheme="brand"
                onClick={() =>
                  updateOutfits([], undefined, blocked.map(washed)).catch(
                    onWriteError
                  )
                }
                sx={{ mt: 3 }}
              >
                Yes, it&apos;s clean
              </Button>
            </Flex>
          )}

          <Box sx={{ mb: 2 }}>
            <Eyebrow>
              {shownLabel}
              {shown.name && ` · ${shown.name}`}
            </Eyebrow>
          </Box>

          <Box
            // Chakra's sx drops custom properties, so set the variable directly
            style={
              {
                // Fit the whole outfit on screen: what's left after the rest
                // of the page and the nav; between 228px and 480px
                "--outfit-height": `clamp(228px, calc(100dvh - ${fixedHeight}px - env(safe-area-inset-top) - var(--chakra-space-nav)), 480px)`,
              } as React.CSSProperties
            }
          >
            <OutfitLayout
              pieces={activePieces}
              missing={pieceIdsOf(shown).length - activePieces.length}
              onMissing={() => openOutfit(shown.id)}
              badge={(item) => wearBadge(item, limits)}
              photoUrl={shown.photoUrl}
              onPhoto={() => openOutfit(shown.id)}
              title={outfitTitle(shown, numberOf(shown))}
            />
          </Box>

          {strip.upcoming.length > 0 && (
            <Grid templateColumns="repeat(4, 1fr)" gap={2} sx={{ mt: 2 }}>
              {[...(strip.last ? [strip.last] : []), ...strip.upcoming].map(
                (outfit) => {
                  const isLast = outfit === strip.last;
                  const title = isLast ? "Last" : `No. ${numberOf(outfit)}`;
                  // Like the Choose sheet: Last as its pieces are now, the
                  // rest after today's wear is counted
                  const isDirty = isLast
                    ? hamperPieces(outfit, itemsById, limits).length > 0
                    : outfit.id !== activeOutfit.id &&
                      !candidates.some(({ id }) => id === outfit.id);
                  const tag = isLast
                    ? sinceLabel(outfit.pickedOn, date).toUpperCase()
                    : undefined;
                  return (
                    <OutfitCard
                      key={outfit.id}
                      outfit={outfit}
                      title={title}
                      itemsById={itemsById}
                      isSelected={outfit.id === shown.id}
                      isDirty={isDirty}
                      tag={tag}
                      ariaLabel={`Show ${isLast ? "the last outfit, " : ""}${outfitTitle(outfit, numberOf(outfit))}${isDirty ? ", a piece in the laundry basket" : ""}`}
                      onClick={() =>
                        setPreviewId(
                          outfit.id === defaultShown?.id ? undefined : outfit.id
                        )
                      }
                    />
                  );
                }
              )}
              <Flex
                as="button"
                onClick={onChooseOpen}
                aria-label="Choose from all outfits"
                sx={{
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "card",
                  border: "1.5px dashed",
                  borderColor: "line",
                  fontWeight: "semibold",
                  fontSize: "sm",
                }}
              >
                All
              </Flex>
            </Grid>
          )}

          {/* Today's jacket, so not under a previewed outfit */}
          {hasJacketCard && isShowingToday && (
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
                    color: "accentText",
                  }}
                >
                  <Icon as={GiSleevelessJacket} sx={{ w: 7, h: 7 }} />
                </Flex>
              )}
              <Box sx={{ flex: 1, minW: 0 }}>
                {/* A lone suitable jacket is only a suggestion until picked */}
                <Eyebrow>
                  {jacket && !chosen ? "Suggested jacket" : "Today's jacket"}
                </Eyebrow>
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
                {...(chosen != null
                  ? { variant: "outline" }
                  : { colorScheme: "brand" })}
              >
                {chosen != null ? "Change" : "Choose"}
              </Button>
            </Flex>
          )}

          <HamperSheet isOpen={isHamperOpen} onClose={onHamperClose} />

          <ChooseSheet
            isOpen={isChooseOpen}
            onClose={onChooseClose}
            outfits={outfits ?? []}
            items={items ?? []}
            todayId={activeOutfit.id}
            upNextId={strip.last ? strip.upcoming[0]?.id : undefined}
            candidates={candidates}
            onChoose={onChoose}
          />

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
                        color: "accentText",
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
                  <Text sx={{ color: "muted", mb: 4 }}>
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
                          <Text sx={{ fontSize: "sm", color: "muted" }}>
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

          <Flex
            sx={{
              // Sticky rather than fixed: it takes its own space after the
              // outfit (never covering a photo) and stays above the nav
              position: "sticky",
              bottom: "nav",
              mt: 4,
              gap: 2,
            }}
          >
            {isPickedToday && isShowingToday ? (
              // Solid like the button: the bar is sticky and sits over the
              // cards while the page scrolls
              <Flex
                sx={{
                  flex: 1,
                  h: 12,
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 1.5,
                  borderRadius: "full",
                  backgroundColor: "card",
                  color: "muted",
                  fontWeight: "semibold",
                }}
              >
                <Icon as={MdCheck} />
                Today&apos;s outfit
              </Flex>
            ) : (
              <Button
                size="lg"
                colorScheme="brand"
                onClick={onWear}
                isDisabled={!isCountReady}
                isLoading={isUpdateOutfitLoading || isUpdateOutfitsLoading}
                sx={{ flex: 1, px: 4, minW: 0 }}
              >
                <Text as="span" noOfLines={1}>
                  {isPickedToday ? "Switch to" : "Wear"}{" "}
                  {outfitTitle(shown, numberOf(shown))}
                  {shown === strip.last && " again"}
                </Text>
              </Button>
            )}
          </Flex>
        </>
      ) : (
        // A photo is enough for an outfit: the first one needs no wardrobe
        <EmptyState
          title="Shall we begin?"
          description="Take one photo of an outfit. 3 is enough to start."
          actionLabel="Add an outfit"
          onAction={openNewOutfit}
        />
      )}
    </>
  );
};

export default Home;
