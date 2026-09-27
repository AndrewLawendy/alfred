import { useEffect, useMemo } from "react";
import {
  Heading,
  Button,
  Flex,
  Grid,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  Text,
  Link,
  Icon,
  IconButton,
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
import { MdCheckroom, MdDryCleaning } from "react-icons/md";
import { orderBy } from "@firebase/firestore";
import { Link as WouterLink } from "wouter";

import Weather from "components/Weather";
import EmptyState from "components/EmptyState";
import Loading from "components/Loading";
import OutfitReference from "components/OutfitReference";
import OutfitItem from "components/OutfitItem";

import useAuth from "hooks/useAuth";

import useData from "resources/useData";
import useUpdateDocument from "resources/useUpdateDocument";
import useWeather from "resources/useWeather";

import { Jacket, Outfit } from "utils/types";

const Home = () => {
  const [user] = useAuth();
  const {
    isOpen: isSingleOutfitOpen,
    onClose: onSingleOutfitClose,
    onOpen: onSingleOutfitOpen,
  } = useDisclosure();
  const {
    isOpen: isJacketDrawerOpen,
    onOpen: onJacketDrawerOpen,
    onClose: onJacketDrawerClose,
  } = useDisclosure({ defaultIsOpen: true });
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
  const [jackets] = useData<Jacket>("wardrobe-items");
  const temperatureJackets = useMemo(() => {
    if (jackets && weatherData) {
      return jackets.filter(
        ({ maxTemperature }) => maxTemperature >= weatherData.main.temp
      );
    } else {
      return [];
    }
  }, [jackets, weatherData]);

  const isJacketPopupOpen =
    isJacketDrawerOpen &&
    !activeOutfit?.jacket &&
    temperatureJackets.length > 1;

  const onFetchNextOutfit = () => {
    if (!outfits) return;

    if (outfits.length === 1) return onSingleOutfitOpen();

    const { order: activeOutfitOrder } = activeOutfit;
    const nextOutfitIndex = (activeOutfitOrder + 1) % outfits.length;
    const nextOutfit = outfits[nextOutfitIndex];

    updateOutfit(nextOutfit.id, { ...nextOutfit, active: true });
    updateOutfit(activeOutfit.id, {
      ...activeOutfit,
      active: false,
      jacket: null,
    });
  };

  const onSwitchCurrentOutfit = () => {
    if (!outfits) return;

    if (outfits.length === 1) return onSingleOutfitOpen();

    const { order: activeOutfitOrder } = activeOutfit;
    const nextOutfitIndex = (activeOutfitOrder + 1) % outfits.length;
    const nextOutfit = outfits[nextOutfitIndex];

    updateOutfit(nextOutfit.id, {
      ...nextOutfit,
      active: true,
      order: activeOutfitOrder,
    });
    updateOutfit(activeOutfit.id, {
      ...activeOutfit,
      order: nextOutfit.order,
      active: false,
      jacket: null,
    });
  };

  useEffect(() => {
    onJacketDrawerOpen();
  }, [activeOutfit, temperatureJackets]);

  if (!user) return null;

  return (
    <>
      <Flex
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
          gap: 3,
          mb: 4,
        }}
      >
        <Heading size="lg" noOfLines={1}>
          Hi, {user.displayName?.split(" ")[0]}
        </Heading>

        <Weather weatherData={weatherData} isLoading={isWeatherLoading} />
      </Flex>

      {isOutfitsLoading ? (
        <Loading message="Loading today's outfit" columns={2} />
      ) : activeOutfit ? (
        <>
          <Grid templateColumns="repeat(2, 1fr)" gap={2} sx={{ mb: 20 }}>
            <OutfitReference reference={activeOutfit.shirt} />
            <OutfitReference reference={activeOutfit.belt} />
            <OutfitReference reference={activeOutfit.pants} />
            <OutfitReference reference={activeOutfit.shoes} />
            {activeOutfit.jacket ? (
              <OutfitItem
                id={activeOutfit.jacket.id}
                type="jacket"
                imageUrl={activeOutfit.jacket.imageUrl}
              />
            ) : temperatureJackets.length === 1 ? (
              <OutfitItem
                id={temperatureJackets[0].id}
                type="jacket"
                imageUrl={temperatureJackets[0].imageUrl}
              />
            ) : temperatureJackets.length > 0 ? (
              <Button onClick={onJacketDrawerOpen} height={172}>
                <Icon as={GiSleevelessJacket} color="gray.400" w={16} h={16} />
              </Button>
            ) : null}
          </Grid>

          <Drawer
            isOpen={isJacketPopupOpen}
            onClose={onJacketDrawerClose}
            placement="bottom"
          >
            <DrawerOverlay />
            <DrawerContent>
              <DrawerHeader
                sx={{
                  boxShadow: "material",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                Choose today&apos;s jacket
              </DrawerHeader>
              <DrawerBody>
                <Text>Several jackets meet the same temperature threshold</Text>
                <Text>Choose the right one to your outfit</Text>
                <Grid templateColumns="repeat(2, 1fr)" gap={2} my={3}>
                  {temperatureJackets.map((jacket) => (
                    <OutfitItem
                      key={jacket.id}
                      id={jacket.id}
                      type="jacket"
                      imageUrl={jacket.imageUrl}
                      onClick={() =>
                        updateOutfit(activeOutfit.id, {
                          jacket,
                        })
                      }
                    />
                  ))}
                </Grid>
              </DrawerBody>
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
                  position: "fixed",
                  bottom: "nav",
                  width: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Button
                  size="lg"
                  colorScheme="teal"
                  onClick={onFetchNextOutfit}
                  isLoading={isUpdateOutfitLoading}
                  sx={{
                    borderRadius: "3xl",
                  }}
                >
                  Fetch Next Outfit
                </Button>

                <IconButton
                  size="lg"
                  borderRadius="full"
                  colorScheme="teal"
                  aria-label="outfit switch"
                  icon={<Icon as={HiSwitchVertical} />}
                  onClick={onSwitchCurrentOutfit}
                />
              </Flex>
            </PopoverAnchor>
            <PopoverContent>
              <PopoverHeader>You only have one outfit!</PopoverHeader>
              <PopoverBody>
                Go to{" "}
                <Link color="teal.500" as={WouterLink} to="/outfits">
                  Outfits
                </Link>{" "}
                and start adding
              </PopoverBody>
              <PopoverArrow />
            </PopoverContent>
          </Popover>
        </>
      ) : (
        <EmptyState
          {...(jackets?.length
            ? {
                icon: MdDryCleaning,
                title: "Build your first outfit",
                description:
                  "Pick a shirt, belt, pants and shoes from your wardrobe.",
                actionLabel: "Create an outfit",
                to: "/outfits",
              }
            : {
                icon: MdCheckroom,
                title: "Start with your wardrobe",
                description: "Add a few shirts, belts, pants and shoes first.",
                actionLabel: "Open wardrobe",
                to: "/wardrobe",
              })}
        />
      )}
    </>
  );
};

export default Home;
