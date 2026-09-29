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
      // A tapped photo growing into its page (utils/photoTransition): crop the
      // snapshots instead of stretching them between the tile's 4:5 and the
      // photo's own shape, keep the rounded corners, and ease like the screens
      "::view-transition-group(item-photo)": {
        animationDuration: "0.36s",
        animationTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
        borderRadius: "22px",
        overflow: "clip",
      },
      "::view-transition-old(item-photo), ::view-transition-new(item-photo)": {
        height: "100%",
        objectFit: "cover",
        overflow: "clip",
      },
      "::view-transition-old(root), ::view-transition-new(root)": {
        animationDuration: "0.28s",
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
  config: {
    // The mode itself comes from the Appearance setting (utils/appearance)
    initialColorMode: "light",
    useSystemColorMode: false,
  },
  // Each colour the screens use, in light and dark. Light: a warm stone page
  // with near-white cards, depth from tone rather than shadows, ink for text
  // and actions, brass for small accents. Dark mirrors it: ink becomes the
  // light colour, so ink fills (chips, notices, buttons) turn light.
  semanticTokens: {
    colors: {
      page: { default: "#EEEDE9", _dark: "#15171C" },
      card: { default: "#FAFAF8", _dark: "#1E2026" },
      surface: { default: "#E3E2DD", _dark: "#272A30" },
      line: { default: "#D6D4CE", _dark: "#33363D" },
      ink: { default: "#15171C", _dark: "#ECEAE5" },
      // Secondary text (5:1 on the page in both)
      muted: { default: "#62656C", _dark: "#A8A6A0" },
      accentText: { default: "accent.600", _dark: "accent.300" },
      dangerText: { default: "red.600", _dark: "red.200" },
      // A light edge on secondary buttons
      outlineEdge: {
        default: "rgba(21, 23, 28, 0.15)",
        _dark: "rgba(236, 234, 229, 0.18)",
      },
      // Blurred labels on photos, the bottom nav, and loading overlays
      frost: {
        default: "rgba(250, 250, 248, 0.9)",
        _dark: "rgba(30, 32, 38, 0.85)",
      },
      pageGlass: {
        default: "rgba(238, 237, 233, 0.9)",
        _dark: "rgba(21, 23, 28, 0.9)",
      },
      // Icons on the notices (ink cards, so light in dark mode)
      noticeSuccess: { default: "accent.300", _dark: "accent.600" },
      noticeError: { default: "red.200", _dark: "red.600" },
      // Quiet text or icons on an ink fill
      onInkMuted: { default: "gray.300", _dark: "gray.600" },
      inkHover: { default: "whiteAlpha.200", _dark: "blackAlpha.100" },
    },
  },
  colors: {
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
              borderColor: "ink",
              boxShadow: "0 0 0 1px var(--chakra-colors-ink)",
            },
          },
          addon: { bg: "card", borderColor: "line", color: "muted" },
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
        // Primary actions are ink, so they flip with the mode
        solid: ({ colorScheme }: { colorScheme: string }) =>
          colorScheme === "brand"
            ? {
                bg: "ink",
                color: "card",
                _hover: { bg: "ink", _disabled: { bg: "ink" } },
                _active: { bg: "ink" },
              }
            : colorScheme === "red"
              ? {
                  // Chakra's dark red is a pale pink; keep it a deep red
                  _dark: {
                    bg: "red.500",
                    color: "white",
                    _hover: { bg: "red.400" },
                    _active: { bg: "red.400" },
                  },
                }
              : {},
        // Secondary actions: a near-white pill with a faint ink edge
        outline: {
          bg: "card",
          color: "ink",
          borderColor: "outlineEdge",
          _hover: { bg: "card" },
          _active: { bg: "surface" },
        },
      },
    },
  },
});

// A blurred label that sits on a photo
export const frosted = {
  backgroundColor: "frost",
  backdropFilter: "blur(8px)",
  color: "ink",
} as const;

export default theme;
