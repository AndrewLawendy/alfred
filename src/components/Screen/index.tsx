import { createContext, ReactNode, useContext } from "react";
import { Box, BoxProps, Flex } from "@chakra-ui/react";

// Each screen in the stack can close itself (and anything opened above it)
export const ScreenContext = createContext<{ close: () => void }>({
  close: () => undefined,
});
export const useScreen = () => useContext(ScreenContext);

// The parts of a full-screen page, laid out like the bottom sheets' parts
export const ScreenHeader = ({ children, sx, ...props }: BoxProps) => (
  <Flex
    as="header"
    {...props}
    sx={{
      alignItems: "center",
      gap: 2,
      px: 2,
      py: 3,
      pt: "calc(var(--chakra-space-3) + env(safe-area-inset-top))",
      fontFamily: "heading",
      fontSize: "2xl",
      // The serif is for the title only
      "& button": { fontFamily: "body", fontSize: "md" },
      ...sx,
    }}
  >
    {children}
  </Flex>
);

export const ScreenBody = ({ children, sx, ...props }: BoxProps) => (
  <Box
    {...props}
    sx={{ flex: 1, minH: 0, overflowY: "auto", px: 6, py: 2, ...sx }}
  >
    {children}
  </Box>
);

export const ScreenFooter = ({
  children,
  sx,
  ...props
}: BoxProps & { children: ReactNode }) => (
  <Flex
    as="footer"
    {...props}
    sx={{
      justifyContent: "flex-end",
      px: 6,
      py: 4,
      pb: "calc(var(--chakra-space-4) + env(safe-area-inset-bottom))",
      ...sx,
    }}
  >
    {children}
  </Flex>
);
