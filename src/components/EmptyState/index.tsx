import { Link } from "wouter";
import { Button, Flex, Heading, Icon, Text } from "@chakra-ui/react";
import { IconType } from "react-icons";

type EmptyStateProps = {
  icon: IconType;
  title: string;
  description: string;
  actionLabel: string;
  // Either navigate somewhere or run a handler
  to?: string;
  onAction?: () => void;
};

const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  to,
  onAction,
}: EmptyStateProps) => (
  <Flex
    sx={{
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      gap: 2,
      py: 10,
      px: 4,
    }}
  >
    <Icon as={icon} sx={{ w: 14, h: 14, color: "gray.300", mb: 2 }} />
    <Heading size="md">{title}</Heading>
    <Text sx={{ color: "gray.600", maxW: "xs" }}>{description}</Text>
    <Button
      {...(to ? { as: Link, to } : { onClick: onAction })}
      colorScheme="teal"
      borderRadius="full"
      mt={4}
    >
      {actionLabel}
    </Button>
  </Flex>
);

export default EmptyState;
