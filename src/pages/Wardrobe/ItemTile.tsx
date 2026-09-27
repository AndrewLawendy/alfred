import { Box, Image, Text } from "@chakra-ui/react";

import { Item } from "utils/types";

type ItemTileProps = {
  item: Item;
  onClick: () => void;
};

const ItemTile = ({ item, onClick }: ItemTileProps) => (
  <Box
    as="button"
    onClick={onClick}
    sx={{
      textAlign: "left",
      minWidth: 0,
      transition: "transform 0.1s",
      _active: { transform: "scale(0.97)" },
    }}
  >
    <Box
      sx={{
        position: "relative",
        aspectRatio: "4 / 5",
        borderRadius: "xl",
        overflow: "hidden",
        backgroundColor: "gray.100",
      }}
    >
      <Image
        src={item.imageUrl}
        alt={item.title}
        sx={{ w: "100%", h: "100%", objectFit: "cover" }}
      />
      {item.type === "jacket" && (
        // The limit that decides when this jacket is suggested
        <Text
          sx={{
            position: "absolute",
            top: 2,
            left: 2,
            px: 2,
            py: 0.5,
            borderRadius: "full",
            backgroundColor: "whiteAlpha.900",
            color: "blue.800",
            fontSize: "xs",
            fontWeight: "semibold",
          }}
        >
          ≤ {item.maxTemperature}°
        </Text>
      )}
    </Box>
    <Text noOfLines={1} sx={{ pt: 2, fontWeight: "semibold" }}>
      {item.title}
    </Text>
    <Text noOfLines={1} sx={{ minH: 5, fontSize: "sm", color: "gray.500" }}>
      {item.description}
    </Text>
  </Box>
);

export default ItemTile;
