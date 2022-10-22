import {
  Box,
  Image,
  Heading,
  Text,
  Skeleton,
  SkeletonProps,
} from "@chakra-ui/react";

interface OutfitItemProps extends SkeletonProps {
  imageUrl: string;
  title?: string;
  description?: string;
  isLoaded?: boolean;
}

const OutfitItem = ({
  title,
  description,
  imageUrl,
  isLoaded = true,
  ...props
}: OutfitItemProps) => {
  return (
    <Skeleton isLoaded={isLoaded} {...props}>
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
          sx={{ width: "100%", height: 162, objectFit: "cover" }}
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
    </Skeleton>
  );
};

export default OutfitItem;
