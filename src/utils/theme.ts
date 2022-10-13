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
});

export default theme;
