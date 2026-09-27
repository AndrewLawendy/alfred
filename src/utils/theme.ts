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
    heading: `"Instrument Serif", Georgia, serif`,
  },
  colors: {
    // Ivory page, ink text, one oxblood accent kept for decisions
    linen: "#FBFAF6",
    surface: "#F3F0E9",
    brand: {
      50: "#F3F0E9",
      100: "#E6E2DA",
      200: "#CDC8BF",
      300: "#A6A199",
      400: "#6F6B65",
      500: "#1A1B1E",
      600: "#141518",
      700: "#0E0F11",
      800: "#08090A",
      900: "#000000",
    },
    accent: {
      50: "#F8EFED",
      100: "#EFDCD8",
      200: "#DDB5AE",
      300: "#C48A80",
      400: "#A05A50",
      500: "#83403A",
      600: "#6B2B2B",
      700: "#5A2323",
      800: "#461B1B",
      900: "#2F1212",
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
        header: {
          fontFamily: "heading",
          fontWeight: "normal",
          fontSize: "2xl",
        },
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
    // Instrument Serif has a single weight; a faux bold smudges it
    Heading: {
      baseStyle: { fontWeight: "normal", letterSpacing: "-0.01em" },
    },
    // red.500 is under 4.5:1 on ivory
    FormError: {
      baseStyle: { text: { color: "red.600" } },
    },
    Button: {
      baseStyle: {
        _active: { transform: "scale(0.97)" },
      },
    },
  },
});

export default theme;
