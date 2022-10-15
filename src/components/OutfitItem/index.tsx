import { Box, Image, Heading, Text, Skeleton } from "@chakra-ui/react";

type OutfitItemProps = {
  title: string;
  description: string;
  imageUrl: string;
  isLoaded: boolean;
};

const OutfitItem = ({
  title,
  description,
  imageUrl,
  isLoaded,
}: OutfitItemProps) => {
  return (
    <Skeleton isLoaded={isLoaded}>
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
      <Heading as="h5" size="sm" sx={{ py: 1 }}>
        {title}
      </Heading>
      <Text fontSize="xs" noOfLines={2}>
        {description}
      </Text>
    </Skeleton>
  );
};

export default OutfitItem;
