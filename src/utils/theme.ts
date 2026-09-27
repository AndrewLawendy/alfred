import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  styles: {
    global: {
      // Chakra sizes drawers and modals with --chakra-vh, which its reset sets
      // to 100lvh: the height with the browser's address bar hidden. That hid
      // the bottom of every sheet and screen (Save buttons included) behind the
      // bar. dvh is the visible height. html:root outranks the reset's :root.
      "@supports (height: 100dvh)": {
        "html:root": { "--chakra-vh": "100dvh" },
      },
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
      // Chakra hard-codes 100vh for drawer heights, which in a browser tab is
      // taller than the visible screen (address bar). $100vh is --chakra-vh,
      // set to the visible height above.
      baseStyle: ({ isFullHeight }: { isFullHeight?: boolean }) => ({
        dialog: {
          bg: "linen",
          maxH: "$100vh",
          ...(isFullHeight && { height: "$100vh" }),
        },
      }),
      sizes: {
        full: { dialog: { h: "$100vh" } },
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
