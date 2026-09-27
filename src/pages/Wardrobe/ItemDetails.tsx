import { orderBy } from "firebase/firestore";
import { Box, Flex, Grid, Heading, Icon, Image, Text } from "@chakra-ui/react";
import { WiThermometer } from "react-icons/wi";

import OutfitReference from "components/OutfitReference";
import useData from "resources/useData";
import { openOutfit } from "utils/history";
import { Item, Outfit } from "utils/types";

const slots = ["shirt", "belt", "pants", "shoes"] as const;

const SectionLabel = ({ children }: { children: string }) => (
  <Text
    sx={{
      mt: 7,
      mb: 2.5,
      fontSize: "sm",
      fontWeight: "semibold",
      letterSpacing: "wide",
      textTransform: "uppercase",
      color: "gray.500",
    }}
  >
    {children}
  </Text>
);

const ItemDetails = ({ item }: { item: Item }) => {
  const [outfits] = useData<Outfit>("outfits", orderBy("order"));
  const usedIn = (outfits || [])
    .map((outfit, index) => ({ outfit, number: index + 1 }))
    .filter(({ outfit }) => slots.some((slot) => outfit[slot]?.id === item.id));

  return (
    <>
      {/* Uncropped, but capped so a tall photo can't push the text off-screen */}
      <Image
        src={item.imageUrl}
        alt={item.title}
        sx={{
          w: "100%",
          maxH: "60vh",
          objectFit: "contain",
          backgroundColor: "gray.50",
        }}
      />

      <Box sx={{ px: 4, pt: 5, pb: 10 }}>
        <Heading size="lg">{item.title}</Heading>
        {item.description && (
          <Text sx={{ mt: 1.5, fontSize: "md", color: "gray.600" }}>
            {item.description}
          </Text>
        )}

        {item.type === "jacket" ? (
          <>
            <Flex
              sx={{
                mt: 4,
                alignItems: "center",
                gap: 2,
                p: 3,
                borderRadius: "xl",
                backgroundColor: "accent.50",
                color: "brand.800",
              }}
            >
              <Icon as={WiThermometer} sx={{ w: 7, h: 7 }} />
              <Text>
                Suggested when it&apos;s <b>{item.maxTemperature}° or cooler</b>
              </Text>
            </Flex>
            <SectionLabel>Picked on Home each day</SectionLabel>
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
                  p: 2,
                  mb: 2,
                  border: "1px solid",
                  borderColor: "gray.100",
                  borderRadius: "xl",
                }}
              >
                <Text sx={{ w: 7, textAlign: "center", fontWeight: "bold" }}>
                  #{number}
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
