import { Link, useRoute } from "wouter";
import { Link as ChakraLink, LinkProps, Icon, Text } from "@chakra-ui/react";
import { IconType } from "react-icons";

interface SideNavItemProps extends LinkProps {
  to: string;
  label: string;
  icon: IconType;
}

const BottomNavItem = ({ to, label, icon, ...rest }: SideNavItemProps) => {
  const [isActive] = useRoute(to);

  return (
    <ChakraLink
      {...rest}
      as={Link}
      to={to}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        lineHeight: "none",
        py: 1,
        px: 3,
        fontSize: "xs",
        color: isActive ? "teal.500" : "gray.500",

        "&:hover": {
          textDecoration: "none",
        },
      }}
    >
      <Icon as={icon} w={6} h={6} />
      <Text>{label}</Text>
    </ChakraLink>
  );
};

export default BottomNavItem;
