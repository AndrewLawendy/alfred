import { useMemo, useState } from "react";
import {
  Heading,
  Button,
  Flex,
  Grid,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  Text,
  Link,
  useDisclosure,
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverArrow,
  PopoverHeader,
  PopoverBody,
} from "@chakra-ui/react";
import { orderBy } from "@firebase/firestore";
import { Link as WouterLink } from "wouter";

import Weather from "components/Weather";
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
  const { isOpen, onClose, onOpen } = useDisclosure();
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
  const [todayJacket, setTodayJacket] = useState<Jacket>();
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
  const isJacketPopupOpen = !todayJacket && temperatureJackets.length > 1;

  const onFetchNextOutfit = () => {
    const { order: activeOutfitOrder } = activeOutfit;

    if (!outfits) return;

    if (outfits.length === 1) return onOpen();

    const nextOutfitIndex = (activeOutfitOrder + 1) % outfits.length;
    const nextOutfit = outfits[nextOutfitIndex];

    updateOutfit(nextOutfit.id, { ...nextOutfit, active: true });
    updateOutfit(activeOutfit.id, { ...activeOutfit, active: false });
  };

  if (!user) return null;

  return (
    <>
      <Flex
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
          height: 12,
          mb: 4,
        }}
      >
        <Heading sx={{ fontFamily: "advent" }} noOfLines={1}>
          Hi, {user.displayName}
        </Heading>

        <Weather weatherData={weatherData} isLoading={isWeatherLoading} />
      </Flex>

      {isOutfitsLoading ? (
        <Loading message="Loading today's outfit, please wait" />
      ) : activeOutfit ? (
        <>
          <Grid templateColumns="repeat(2, 1fr)" gap={2} sx={{ mb: 20 }}>
            <OutfitReference reference={activeOutfit.shirt} />
            <OutfitReference reference={activeOutfit.belt} />
            <OutfitReference reference={activeOutfit.pants} />
            <OutfitReference reference={activeOutfit.shoes} />
            {todayJacket ? (
              <OutfitItem id={todayJacket.id} imageUrl={todayJacket.imageUrl} />
            ) : temperatureJackets.length === 1 ? (
              <OutfitItem
                id={temperatureJackets[0].id}
                imageUrl={temperatureJackets[0].imageUrl}
              />
            ) : isJacketPopupOpen ? (
              <Drawer
                isOpen={isJacketPopupOpen}
                onClose={() => false}
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
                    <Text>
                      Several jackets meet the same temperature threshold
                    </Text>
                    <Text>Choose the right one to your outfit</Text>
                    <Grid templateColumns="repeat(2, 1fr)" gap={2} my={3}>
                      {temperatureJackets.map((jacket) => (
                        <OutfitItem
                          key={jacket.id}
                          id={jacket.id}
                          imageUrl={jacket.imageUrl}
                          onClick={() => setTodayJacket(jacket)}
                        />
                      ))}
                    </Grid>
                  </DrawerBody>
                </DrawerContent>
              </Drawer>
            ) : null}
          </Grid>

          <Popover isOpen={isOpen} onClose={onClose} placement="top">
            <PopoverAnchor>
              <Button
                size="lg"
                colorScheme="teal"
                onClick={onFetchNextOutfit}
                isLoading={isUpdateOutfitLoading}
                sx={{
                  borderRadius: "3xl",
                  position: "fixed",
                  bottom: 16,
                  left: "50%",
                  transform: "translate3d(-50%, 0, 0)",
                }}
              >
                Fetch Next Outfit
              </Button>
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
        <Alert
          status="warning"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
        >
          <AlertIcon boxSize="30px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            No outfits
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            Go to{" "}
            <Link color="teal.500" as={WouterLink} to="/outfits">
              Outfits
            </Link>{" "}
            and start adding
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default Home;
