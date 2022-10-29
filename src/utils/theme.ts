import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  styles: {
    global: {
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
  shadows: {
    material: "0 2px 4px var(--chakra-colors-gray-300)",
    "reverse-material": "0 -2px 4px var(--chakra-colors-gray-300)",
  },
});

export default theme;
