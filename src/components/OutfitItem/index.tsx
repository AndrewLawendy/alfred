import { Box, Image, Heading, Text } from "@chakra-ui/react";

type OutfitItemProps = { title: string; description: string; imageUrl: string };

const OutfitItem = ({ title, description, imageUrl }: OutfitItemProps) => {
  return (
    <Box>
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
    </Box>
  );
};

export default OutfitItem;
