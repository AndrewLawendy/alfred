import { useEffect, useState } from "react";
import { Box } from "@chakra-ui/react";

// No app bar: pages carry their own titles. This strip only keeps content out
// from under the status bar and draws a hairline once the page has scrolled.
const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Box
      as="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: "sticky",
        height: "env(safe-area-inset-top)",
        backgroundColor: "page",
        borderBottom: "1px solid",
        borderColor: isScrolled ? "gray.200" : "transparent",
        transition: "border-color 0.2s",
      }}
    />
  );
};

export default Header;
