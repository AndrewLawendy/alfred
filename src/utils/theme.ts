import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  styles: {
    global: {
      "html, body": {
        overscrollBehavior: "none",
        WebkitTapHighlightColor: "transparent",
      },
      "a, button, [role=button], label, footer": {
        touchAction: "manipulation",
        userSelect: "none",
      },
      "#root": {
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      },
    },
  },
  fonts: {
    body: `"Roboto", sans-serif`,
    advent: `"Advent Pro", sans-serif`,
  },
  space: {
    // Bottom nav height plus the iPhone home indicator
    nav: "calc(4rem + env(safe-area-inset-bottom))",
  },
  shadows: {
    material: "0 2px 4px var(--chakra-colors-gray-300)",
    "reverse-material": "0 -2px 4px var(--chakra-colors-gray-300)",
  },
  components: {
    Button: {
      baseStyle: {
        _active: { transform: "scale(0.97)" },
      },
    },
  },
});

export default theme;
