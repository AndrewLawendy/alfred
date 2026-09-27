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
    // The phone's own font (San Francisco on iOS, Roboto on Android)
    body: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`,
    heading: `"Fraunces", Georgia, serif`,
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
    Button: {
      baseStyle: {
        _active: { transform: "scale(0.97)" },
      },
    },
  },
});

export default theme;
