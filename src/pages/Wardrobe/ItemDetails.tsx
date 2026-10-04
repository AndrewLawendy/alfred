import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  Icon,
  Image,
  Select,
  Text,
} from "@chakra-ui/react";
import { WiThermometer } from "react-icons/wi";

import OutfitReference from "components/OutfitReference";
import { Eyebrow } from "components/PageHeader";
import useNotice from "hooks/useNotice";
import useOutfits from "resources/useOutfits";
import useLimits from "resources/useLimits";
import useUpdateOutfits from "resources/useUpdateOutfits";
import {
  DEFAULT_LIMITS,
  isInHamper,
  limitOf,
  localDate,
  sinceLabel,
  toHamper,
  washed,
} from "utils/laundry";
import { openOutfit } from "utils/history";
import { pieceIdsOf } from "utils/wardrobe";
import { Item } from "utils/types";

const SectionLabel = ({ children }: { children: string }) => (
  <Box sx={{ mt: 8, mb: 3 }}>
    <Eyebrow>{children}</Eyebrow>
  </Box>
);

const ItemDetails = ({ item }: { item: Item }) => {
  const [outfits] = useOutfits();
  const usedIn = (outfits || [])
    .map((outfit, index) => ({ outfit, number: index + 1 }))
    .filter(({ outfit }) => pieceIdsOf(outfit).includes(item.id));
  const limits = useLimits();
  const [updateOutfits, isSaving] = useUpdateOutfits();
  const toast = useNotice();
  const isDirty = isInHamper(item, limits);
  const limit = limitOf(item, limits);
  // Washed, or into the hamper by hand (a spill), for counted pieces only
  const onLaundry = () =>
    updateOutfits([], undefined, [
      isDirty ? washed(item) : toHamper(item, limits, localDate()),
    ]).catch(() =>
      toast({
        status: "error",
        title: "Couldn't update this piece",
        description: "Nothing was changed. Please try again.",
      })
    );
  const categoryLimit = limits[item.type] ?? DEFAULT_LIMITS[item.type] ?? 0;
  // Its own count, or "" to follow its category's
  const onWearLimit = (value: string) =>
    updateOutfits([], undefined, [
      { id: item.id, changes: { wearLimit: value === "" ? null : +value } },
    ]).catch(() =>
      toast({
        status: "error",
        title: "Couldn't save this piece",
        description: "Nothing was changed. Please try again.",
      })
    );

  return (
    <>
      <Box sx={{ px: 4, pt: 2, pb: 10 }}>
        {/* The whole photo at its own shape, capped so a tall one can't push
            the text off-screen */}
        <Image
          src={item.imageUrl}
          alt={item.title}
          data-photo-target={item.id}
          sx={{
            display: "block",
            maxW: "100%",
            maxH: "60vh",
            mx: "auto",
            borderRadius: "card",
          }}
        />

        <Box sx={{ mt: 6 }}>
          <Eyebrow>{item.type}</Eyebrow>
        </Box>
        <Heading sx={{ mt: 1, fontSize: "4xl", lineHeight: 1.15 }}>
          {item.title}
        </Heading>
        {item.description && (
          <Text sx={{ mt: 2, fontSize: "md", color: "muted" }}>
            {item.description}
          </Text>
        )}

        {limit && (
          <Flex
            sx={{
              mt: 6,
              gap: 3,
              p: 4,
              alignItems: "center",
              borderRadius: "card",
              backgroundColor: "card",
            }}
          >
            <Text sx={{ flex: 1, fontWeight: "semibold" }}>
              {isDirty
                ? `In the hamper since ${sinceLabel(item.lastWornOn)}`
                : `${item.wears ?? 0} of ${limit} wear${limit === 1 ? "" : "s"}`}
            </Text>
            <Button variant="outline" onClick={onLaundry} isLoading={isSaving}>
              {isDirty ? "Washed" : "Put in hamper"}
            </Button>
          </Flex>
        )}

        {item.type !== "outerwear" && (
          <FormControl
            sx={{
              mt: 3,
              p: 4,
              display: "flex",
              alignItems: "center",
              gap: 3,
              borderRadius: "card",
              backgroundColor: "card",
            }}
          >
            <FormLabel sx={{ flex: 1, minW: 0, m: 0, fontWeight: "semibold" }}>
              Wears before washing
            </FormLabel>
            <Select
              value={item.wearLimit ?? ""}
              onChange={(event) => onWearLimit(event.target.value)}
              rootProps={{ w: "auto", flexShrink: 0 }}
            >
              <option value="">
                {categoryLimit
                  ? `Default (${categoryLimit})`
                  : "Default (not counted)"}
              </option>
              {Array.from({ length: 10 }, (_, index) => (
                <option key={index + 1} value={index + 1}>
                  {index + 1}
                </option>
              ))}
              <option value={0}>Not counted</option>
            </Select>
          </FormControl>
        )}

        {item.type === "outerwear" ? (
          <>
            <Flex
              sx={{
                mt: 6,
                gap: 3,
                p: 4,
                borderRadius: "card",
                backgroundColor: "card",
              }}
            >
              <Icon
                as={WiThermometer}
                sx={{ w: 7, h: 7, flexShrink: 0, color: "accent.500" }}
              />
              <Box>
                <Text sx={{ fontWeight: "semibold" }}>
                  Suggested at {item.maxTemperature}° or cooler
                </Text>
                <Text sx={{ mt: 1, color: "muted" }}>
                  Jackets go with any outfit. When it&apos;s cold enough, Home
                  asks which one to wear with the day&apos;s outfit.
                </Text>
              </Box>
            </Flex>
          </>
        ) : (
          <>
            <SectionLabel>
              {`Used in ${usedIn.length} outfit${
                usedIn.length === 1 ? "" : "s"
              }`}
            </SectionLabel>
            {usedIn.map(({ outfit, number }) => (
              <Flex
                key={outfit.id}
                as="button"
                onClick={() => openOutfit(outfit.id)}
                sx={{
                  w: "100%",
                  textAlign: "left",
                  transition: "transform 0.1s",
                  _active: { transform: "scale(0.98)" },
                  alignItems: "center",
                  gap: 3,
                  p: 3,
                  mb: 2,
                  borderRadius: "card",
                  backgroundColor: "card",
                }}
              >
                <Text
                  sx={{
                    w: 8,
                    textAlign: "center",
                    fontFamily: "heading",
                    fontSize: "2xl",
                  }}
                >
                  {number}
                </Text>
                <Grid
                  templateColumns="repeat(4, 1fr)"
                  gap={1.5}
                  sx={{ flex: 1, pointerEvents: "none" }}
                >
                  {outfit.pieces.slice(0, 4).map((reference) => (
                    <OutfitReference
                      key={reference.id}
                      reference={reference}
                      aspectRatio={1}
                      radius="thumb"
                    />
                  ))}
                </Grid>
              </Flex>
            ))}
          </>
        )}
      </Box>
    </>
  );
};

export default ItemDetails;
