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
        bg: "page",
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
    heading: `"Bodoni Moda", "Didot", Georgia, serif`,
  },
  colors: {
    // Warm stone page with near-white cards: depth from tone, not shadows.
    // Ink for text and actions, brass for small accents.
    page: "#EEEDE9",
    card: "#FAFAF8",
    surface: "#E3E2DD",
    line: "#D6D4CE",
    // Warm greys; 600 is the secondary text colour (5:1 on the page)
    gray: {
      50: "#F5F4F1",
      100: "#E3E2DD",
      200: "#D6D4CE",
      300: "#BDBAB3",
      400: "#8E8C86",
      500: "#75777D",
      600: "#62656C",
      700: "#45474D",
      800: "#2A2C31",
      900: "#15171C",
    },
    brand: {
      50: "#F5F4F1",
      100: "#E3E2DD",
      200: "#CDCBC5",
      300: "#A3A39F",
      400: "#62656C",
      500: "#15171C",
      600: "#0F1114",
      700: "#0A0B0D",
      800: "#050607",
      900: "#000000",
    },
    // Brass: 500 for icons and rings; 600 and up for text (500 is under
    // 4.5:1 on the page)
    accent: {
      50: "#F6F1E8",
      100: "#EDE3D1",
      200: "#DCC7A3",
      300: "#C4A676",
      400: "#AD8C5C",
      500: "#9A7646",
      600: "#7F6038",
      700: "#654C2C",
      800: "#4B3921",
      900: "#322616",
    },
    red: {
      50: "#FBEAEA",
      100: "#F3C9C9",
      200: "#E49A9A",
      300: "#D26B6B",
      400: "#BD4545",
      500: "#9B2C2C",
      600: "#822727",
      700: "#6B2020",
      800: "#541919",
      900: "#3D1212",
    },
  },
  radii: {
    card: "22px",
    field: "18px",
    thumb: "12px",
  },
  space: {
    // Bottom nav height plus the iPhone home indicator
    nav: "calc(4.75rem + env(safe-area-inset-bottom))",
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
          bg: "page",
          maxH: "$100vh",
          ...(isFullHeight && { height: "$100vh" }),
        },
      }),
      sizes: {
        full: { dialog: { h: "$100vh" } },
      },
    },
    // Only the regular weight is loaded; a faux bold smudges Bodoni
    Heading: {
      baseStyle: { fontWeight: "normal" },
    },
    Input: {
      sizes: {
        md: {
          field: { h: 12, fontSize: "md", borderRadius: "field", px: 4 },
          addon: { h: 12, borderRadius: "field" },
        },
      },
      variants: {
        outline: {
          field: {
            bg: "card",
            borderColor: "line",
            _hover: { borderColor: "gray.300" },
            _focusVisible: {
              borderColor: "brand.500",
              boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
            },
          },
          addon: { bg: "card", borderColor: "line", color: "gray.600" },
        },
      },
    },
    Button: {
      baseStyle: {
        borderRadius: "full",
        _active: { transform: "scale(0.97)" },
      },
      sizes: {
        md: { h: "44px", px: 5 },
        lg: { h: 12, fontSize: "md" },
      },
      variants: {
        // Secondary actions: a near-white pill with a faint ink edge
        outline: {
          bg: "card",
          color: "brand.500",
          borderColor: "rgba(21, 23, 28, 0.15)",
          _hover: { bg: "card" },
          _active: { bg: "surface" },
        },
      },
    },
  },
});

// A near-white, blurred label that sits on a photo
export const frosted = {
  backgroundColor: "rgba(250, 250, 248, 0.9)",
  backdropFilter: "blur(8px)",
  color: "brand.500",
} as const;

export default theme;
