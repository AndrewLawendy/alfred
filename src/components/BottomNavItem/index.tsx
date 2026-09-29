import { Link, useRoute } from "wouter";
import { Link as ChakraLink, LinkProps, Icon, Text } from "@chakra-ui/react";
import { IconType } from "react-icons";
import { motion } from "framer-motion";

interface BottomNavItemProps extends LinkProps {
  to: string;
  label: string;
  icon: IconType;
}

const BottomNavItem = ({ to, label, icon, ...rest }: BottomNavItemProps) => {
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
        position: "relative",
        pt: 2.5,
        pb: 1.5,
        minHeight: 16,
        fontSize: "xs",
        fontWeight: "medium",
        color: isActive ? "brand.500" : "gray.600",

        "&:hover": {
          textDecoration: "none",
        },
      }}
    >
      {isActive && (
        // One brass bar that glides to the newly active tab
        <motion.div
          layoutId="nav-bar"
          transition={{ type: "spring", stiffness: 500, damping: 40 }}
          style={{
            position: "absolute",
            top: -1,
            width: 24,
            height: 2,
            borderRadius: 9999,
            background: "var(--chakra-colors-accent-500)",
          }}
        />
      )}
      {/* A heavier stroke marks the active tab */}
      <Icon as={icon} strokeWidth={isActive ? 2.2 : 1.6} sx={{ w: 6, h: 6 }} />
      <Text>{label}</Text>
    </ChakraLink>
  );
};

export default BottomNavItem;
