import { Box, Image, Text } from "@chakra-ui/react";

import { frosted } from "utils/theme";
import { Item } from "utils/types";

type ItemTileProps = {
  item: Item;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
  // 🧺 or wear pips, top right
  badge?: string;
  // In the hamper: dimmed, still in its place
  isDimmed?: boolean;
};

const ItemTile = ({ item, onClick, badge, isDimmed }: ItemTileProps) => (
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
        borderRadius: "card",
        overflow: "hidden",
        backgroundColor: "surface",
      }}
    >
      <Image
        src={item.imageUrl}
        alt={item.title}
        data-photo-source={item.id}
        sx={{
          w: "100%",
          h: "100%",
          objectFit: "cover",
          opacity: isDimmed ? 0.45 : 1,
        }}
      />
      {badge && (
        <Text
          sx={{
            ...frosted,
            position: "absolute",
            top: 2.5,
            right: 2.5,
            px: 2.5,
            py: 0.5,
            borderRadius: "full",
            fontSize: "xs",
            fontWeight: "semibold",
          }}
        >
          {badge}
        </Text>
      )}
      {item.type === "outerwear" && (
        // The limit that decides when this jacket is suggested
        <Text
          sx={{
            ...frosted,
            position: "absolute",
            top: 2.5,
            left: 2.5,
            px: 2.5,
            py: 0.5,
            borderRadius: "full",
            fontSize: "xs",
            fontWeight: "semibold",
          }}
        >
          ≤ {item.maxTemperature}°
        </Text>
      )}
    </Box>
    <Text
      noOfLines={1}
      sx={{ pt: 2.5, fontFamily: "heading", fontSize: "lg", lineHeight: 1.3 }}
    >
      {item.title}
    </Text>
    <Text noOfLines={1} sx={{ minH: 5, fontSize: "sm", color: "muted" }}>
      {item.description}
    </Text>
  </Box>
);

export default ItemTile;
