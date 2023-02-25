import { Link } from "wouter";
import {
  Box,
  Image,
  Heading,
  Text,
  Skeleton,
  SkeletonProps,
} from "@chakra-ui/react";
import { ReactNode } from "react";

interface OutfitItemProps extends SkeletonProps {
  id: string;
  imageUrl: string;
  title?: string;
  description?: string;
  isLoaded?: boolean;
}

const OutfitItem = ({
  id,
  title,
  description,
  imageUrl,
  isLoaded = true,
  ...props
}: OutfitItemProps) => {
  const Wrapper = ({ children }: { children: ReactNode }) =>
    props.onClick ? (
      <>{children}</>
    ) : (
      <Link to={`wardrobe/${id}`}>{children}</Link>
    );

  return (
    <Skeleton isLoaded={isLoaded} {...props}>
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
      </Wrapper>
    </Skeleton>
  );
};

export default OutfitItem;
