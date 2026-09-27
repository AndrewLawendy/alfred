import {
  Box,
  Image,
  Heading,
  Text,
  Skeleton,
  SkeletonProps,
} from "@chakra-ui/react";
import { ReactNode } from "react";
import { openItem } from "utils/history";
import { Item } from "utils/types";

interface OutfitItemProps extends SkeletonProps, Pick<Item, "type"> {
  id: string;
  imageUrl: string;
  title?: string;
  description?: string;
  isLoaded?: boolean;
  // Crop the photo to this ratio instead of the default 162px height
  aspectRatio?: number;
}

const OutfitItem = ({
  id,
  title,
  description,
  imageUrl,
  isLoaded = true,
  type,
  aspectRatio,
  ...props
}: OutfitItemProps) => {
  const Wrapper = ({ children }: { children: ReactNode }) =>
    props.onClick ? (
      <>{children}</>
    ) : (
      <Box
        as="button"
        onClick={() => openItem(id)}
        sx={{ display: "block", w: "100%", textAlign: "left" }}
      >
        {children}
      </Box>
    );

  return (
    <Skeleton
      isLoaded={isLoaded}
      transition="transform 0.1s"
      _active={{ transform: "scale(0.97)" }}
      {...props}
    >
      <Wrapper>
        <Box
          sx={{
            p: 1,
            border: "1px solid",
            borderColor: "gray.100",
            textAlign: "center",
          }}
        >
          <Image
            alt={title}
            src={imageUrl}
            sx={{
              width: "100%",
              objectFit: "cover",
              ...(aspectRatio
                ? { aspectRatio: `${aspectRatio}` }
                : { height: 162 }),
            }}
          />
        </Box>
        {title && (
          <Heading as="h5" size="sm" sx={{ py: 1 }}>
            {title}
          </Heading>
        )}
        {description && (
          <Text fontSize="xs" noOfLines={2}>
            {description}
          </Text>
        )}
      </Wrapper>
    </Skeleton>
  );
};

export default OutfitItem;
