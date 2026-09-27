import { Link, useRoute } from "wouter";
import {
  Link as ChakraLink,
  LinkProps,
  Icon,
  Text,
  Box,
} from "@chakra-ui/react";
import { IconType } from "react-icons";
import { motion } from "framer-motion";

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
        color: isActive ? "brand.700" : "gray.600",

        "&:hover": {
          textDecoration: "none",
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          width: 16,
          py: 0.5,
        }}
      >
        {isActive && (
          // One shared pill that glides to the newly active tab
          <motion.div
            layoutId="nav-pill"
            transition={{ type: "spring", stiffness: 500, damping: 40 }}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 9999,
              background: "var(--chakra-colors-accent-100)",
            }}
          />
        )}
        <Icon
          as={isActive ? activeIcon : icon}
          sx={{ position: "relative", w: 6, h: 6 }}
        />
      </Box>
      <Text>{label}</Text>
    </ChakraLink>
  );
};

export default BottomNavItem;
