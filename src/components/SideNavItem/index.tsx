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
      sx={{
        fontSize: "xl",
        fontWeight: "semibold",
        fontFamily: "advent",
        color: isActive ? "teal.500" : "gray.600",
        backgroundColor: isActive ? "gray.100" : undefined,
        px: 3,
        py: 1,
        borderRadius: "md",
        transition: "background-color .2s",

        "&:hover": {
          textDecoration: "none",
          backgroundColor: "gray.50",
        },
      }}
    />
  );
};

export default SideNavItem;
