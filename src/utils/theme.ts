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
      body: {
        bg: "linen",
      },
      "#root": {
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        // 100vh ignores the phone browser's address bar, leaving a scroll on
        // every page; dvh follows the visible area
        "@supports (min-height: 100dvh)": { minHeight: "100dvh" },
      },
    },
  },
  fonts: {
    // The phone's own font (San Francisco on iOS, Roboto on Android)
    body: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`,
    heading: `"Fraunces", Georgia, serif`,
  },
  colors: {
    // Tuxedo palette: ink like the logo, brass accents, a warm linen page
    linen: "#FAF8F5",
    brand: {
      50: "#F4F2EE",
      100: "#E4E1DB",
      200: "#C9C5BD",
      300: "#A29D94",
      400: "#6E6A64",
      500: "#1F2328",
      600: "#16191D",
      700: "#0E1013",
      800: "#08090B",
      900: "#000000",
    },
    accent: {
      50: "#FAF5EC",
      100: "#F1E6D2",
      200: "#E3CFA8",
      300: "#D0B37E",
      400: "#B08D57",
      500: "#9A7646",
      600: "#7F6038",
      700: "#654C2C",
      800: "#4B3921",
      900: "#322616",
    },
  },
  space: {
    // Bottom nav height plus the iPhone home indicator
    nav: "calc(4.75rem + env(safe-area-inset-bottom))",
  },
  shadows: {
    material: "0 2px 4px var(--chakra-colors-gray-300)",
    "reverse-material": "0 -2px 4px var(--chakra-colors-gray-300)",
  },
  components: {
    Drawer: {
      baseStyle: {
        dialog: { bg: "linen" },
      },
    },
    Button: {
      baseStyle: {
        _active: { transform: "scale(0.97)" },
      },
    },
  },
});

export default theme;
