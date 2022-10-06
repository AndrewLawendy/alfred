import { Link, useRoute } from "wouter";
import { Link as ChakraLink, LinkProps } from "@chakra-ui/react";

interface SideNavItemProps extends LinkProps {
  to: string;
}

const SideNavItem = ({ to, ...rest }: SideNavItemProps) => {
  const [isActive] = useRoute(to);

  return (
    <ChakraLink
      {...rest}
      as={Link}
      to={to}
      color={isActive ? "teal.500" : undefined}
    />
  );
};

export default SideNavItem;
