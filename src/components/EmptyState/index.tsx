import { Link } from "wouter";
import { Button, Flex, Heading, Icon, Image, Text } from "@chakra-ui/react";
import { MdAdd } from "react-icons/md";

import Logo from "assets/alfred-mark.svg";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel: string;
  // Either navigate somewhere or run a handler
  to?: string;
  onAction?: () => void;
};

const EmptyState = ({
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
      px: 5,
      border: "1.5px dashed",
      borderColor: "line",
      borderRadius: "card",
    }}
  >
    <Image
      src={Logo}
      alt=""
      sx={{ h: 12, mb: 3, _dark: { filter: "invert(1)" } }}
    />
    <Heading sx={{ fontSize: "2xl" }}>{title}</Heading>
    <Text sx={{ color: "muted", maxW: "xs" }}>{description}</Text>
    <Button
      {...(to ? { as: Link, to } : { onClick: onAction })}
      colorScheme="brand"
      size="lg"
      leftIcon={<Icon as={MdAdd} sx={{ w: 5, h: 5 }} />}
      mt={4}
    >
      {actionLabel}
    </Button>
  </Flex>
);

export default EmptyState;
