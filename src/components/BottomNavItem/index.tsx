import { Link, useRoute } from "wouter";
import {
  Link as ChakraLink,
  LinkProps,
  Icon,
  Text,
  Box,
} from "@chakra-ui/react";
import { IconType } from "react-icons";

interface SideNavItemProps extends LinkProps {
  to: string;
  label: string;
  icon: IconType;
  activeIcon: IconType;
}

const BottomNavItem = ({
  to,
  label,
  icon,
  activeIcon,
  ...rest
}: SideNavItemProps) => {
  // Match nested routes too, e.g. /wardrobe/shirt/new
  const [isActive] = useRoute(to === "/" ? "/" : `${to}/:rest*`);

  return (
    <ChakraLink
      {...rest}
      as={Link}
      to={to}
      aria-current={isActive ? "page" : undefined}
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
        pt: 2,
        pb: 1,
        minHeight: 14,
        fontSize: "xs",
        fontWeight: isActive ? "semibold" : "normal",
        color: isActive ? "teal.700" : "gray.500",

        "&:hover": {
          textDecoration: "none",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          width: 16,
          py: 0.5,
          borderRadius: "full",
          backgroundColor: isActive ? "teal.100" : "transparent",
          transition: "background-color 0.2s",
        }}
      >
        <Icon as={isActive ? activeIcon : icon} w={6} h={6} />
      </Box>
      <Text>{label}</Text>
    </ChakraLink>
  );
};

export default BottomNavItem;
