import { orderBy } from "firebase/firestore";
import { Box, Flex, Grid, Heading, Icon, Image, Text } from "@chakra-ui/react";
import { WiThermometer } from "react-icons/wi";

import OutfitReference from "components/OutfitReference";
import { Eyebrow } from "components/PageHeader";
import useData from "resources/useData";
import { openOutfit } from "utils/history";
import { Item, Outfit } from "utils/types";

const slots = ["shirt", "belt", "pants", "shoes"] as const;

const SectionLabel = ({ children }: { children: string }) => (
  <Box sx={{ mt: 8, mb: 3 }}>
    <Eyebrow>{children}</Eyebrow>
  </Box>
);

const ItemDetails = ({ item }: { item: Item }) => {
  const [outfits] = useData<Outfit>("outfits", orderBy("order"));
  const usedIn = (outfits || [])
    .map((outfit, index) => ({ outfit, number: index + 1 }))
    .filter(({ outfit }) => slots.some((slot) => outfit[slot]?.id === item.id));

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
          <Text sx={{ mt: 2, fontSize: "md", color: "gray.600" }}>
            {item.description}
          </Text>
        )}

        {item.type === "jacket" ? (
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
                <Text sx={{ mt: 1, color: "gray.600" }}>
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
                  {slots.map((slot) => (
                    <OutfitReference
                      key={slot}
                      reference={outfit[slot]}
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
