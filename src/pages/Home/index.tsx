import {
  Heading,
  Button,
  Flex,
  Grid,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
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
// import OutfitItem from "components/OutfitItem";
import OutfitReference from "components/OutfitReference";
import Loading from "components/Loading";

import useAuth from "hooks/useAuth";

import useData from "resources/useData";
import useUpdateDocument from "resources/useUpdateDocument";

import { Outfit } from "utils/types";
import { useMemo } from "react";

const Home = () => {
  const [user] = useAuth();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [outfits, isOutfitsLoading] = useData<Outfit>(
    "outfits",
    orderBy("order")
  );
  const [updateOutfit, isUpdateOutfitLoading] = useUpdateDocument("outfits");
  const [firstOutfit] = outfits || [];
  const activeOutfit = useMemo(() => {
    return outfits?.find(({ active }) => active) || firstOutfit;
  }, [outfits]);

  const onFetchNextOutfit = () => {
    const { order: activeOutfitOrder } = activeOutfit;

    if (!outfits) return;

    if (outfits.length === 1) return onOpen();

    if (activeOutfitOrder === outfits?.length - 1) {
      updateOutfit(firstOutfit.id, { ...firstOutfit, active: true });
    } else {
      const nextOutfit = outfits[activeOutfitOrder + 1];

      updateOutfit(nextOutfit.id, { ...nextOutfit, active: true });
    }

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

        <Weather />
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
