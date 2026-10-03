import { ReactNode } from "react";
import { Box, Image, Text, Skeleton, SkeletonProps } from "@chakra-ui/react";

import { openItemFromPhoto } from "utils/photoTransition";
import { frosted } from "utils/theme";
import { Item } from "utils/types";

interface OutfitItemProps extends SkeletonProps, Pick<Item, "type"> {
  id: string;
  imageUrl: string;
  title?: string;
  // Show the name on a frosted label over the photo
  isLabelled?: boolean;
  isLoaded?: boolean;
  // Crop the photo to this ratio instead of the default 162px height
  aspectRatio?: number;
  radius?: string;
  // A small mark in the corner, e.g. 🧺 for a piece in the hamper
  badge?: ReactNode;
}

const OutfitItem = ({
  id,
  title,
  isLabelled,
  imageUrl,
  isLoaded = true,
  type,
  aspectRatio,
  radius = "card",
  badge,
  ...props
}: OutfitItemProps) => {
  const photo = (
    <Box
      sx={{
        position: "relative",
        borderRadius: radius,
        overflow: "hidden",
        backgroundColor: "surface",
      }}
    >
      <Image
        alt={isLabelled ? "" : title}
        src={imageUrl}
        data-photo-source={id}
        sx={{
          display: "block",
          width: "100%",
          objectFit: "cover",
          ...(aspectRatio
            ? { aspectRatio: `${aspectRatio}` }
            : // A parent (Home) can shrink photos to fit the screen
              { height: "var(--outfit-photo-height, 162px)" }),
        }}
      />
      {badge && (
        <Text
          sx={{
            ...frosted,
            position: "absolute",
            top: 2,
            left: 2,
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
      {isLabelled && title && (
        <Text
          noOfLines={1}
          sx={{
            ...frosted,
            position: "absolute",
            left: 2,
            bottom: 2,
            maxW: "calc(100% - 16px)",
            px: 3,
            py: 1,
            borderRadius: "field",
            fontFamily: "heading",
            fontSize: "md",
          }}
        >
          {title}
        </Text>
      )}
    </Box>
  );

  return (
    <Skeleton
      isLoaded={isLoaded}
      borderRadius={radius}
      transition="transform 0.1s"
      _active={{ transform: "scale(0.97)" }}
      {...props}
    >
      {props.onClick ? (
        photo
      ) : (
        // A plain element, not a component made per render: a new component
        // type each render remounted the photo on every re-render
        <Box
          as="button"
          onClick={(event: React.MouseEvent<HTMLElement>) =>
            openItemFromPhoto(id, event.currentTarget.querySelector("img"))
          }
          aria-label={title}
          sx={{ display: "block", w: "100%", textAlign: "left" }}
        >
          {photo}
        </Box>
      )}
    </Skeleton>
  );
};

export default OutfitItem;
