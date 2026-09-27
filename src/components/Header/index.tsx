import { useLocation } from "wouter";
import { Flex, Image, Heading } from "@chakra-ui/react";

import Logo from "assets/logo.png";

const titles: Record<string, string> = {
  "": "Today",
  outfits: "Outfits",
  wardrobe: "Wardrobe",
  account: "Account",
};

const Header = () => {
  const [location] = useLocation();
  const title = titles[location.split("/")[1].toLowerCase()];

  return (
    <Flex
      as="header"
      sx={{
        minHeight: 16,
        p: 2,
        pt: "calc(var(--chakra-space-2) + env(safe-area-inset-top))",
        px: 3,
        gap: 3,
        alignItems: "center",
        boxShadow: "material",
        position: "sticky",
        top: 0,
        backgroundColor: "white",
      }}
    >
      <Image src={Logo} alt="" sx={{ maxH: 8 }} />
      <Heading as="h1" sx={{ fontFamily: "advent", fontSize: "3xl" }}>
        {title}
      </Heading>
    </Flex>
  );
};

export default Header;
