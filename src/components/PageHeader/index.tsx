import { ReactNode } from "react";
import { Box, Flex, Heading, Text } from "@chakra-ui/react";

type PageHeaderProps = {
  title: ReactNode;
  // Small caps line above the title, e.g. the date
  eyebrow?: string;
  subtitle?: string;
  // A button beside the title, e.g. New
  action?: ReactNode;
};

// Each page opens with its own large serif title rather than an app bar
const PageHeader = ({ title, eyebrow, subtitle, action }: PageHeaderProps) => (
  <Flex sx={{ alignItems: "flex-end", gap: 3, mb: 4 }}>
    <Box sx={{ flex: 1, minW: 0 }}>
      {eyebrow && (
        <Text
          sx={{
            fontSize: "xs",
            fontWeight: "semibold",
            letterSpacing: "wider",
            textTransform: "uppercase",
            color: "gray.600",
          }}
        >
          {eyebrow}
        </Text>
      )}
      <Heading as="h1" noOfLines={1} sx={{ fontSize: "4xl", lineHeight: 1.1 }}>
        {title}
      </Heading>
      {subtitle && <Text sx={{ mt: 0.5, color: "gray.600" }}>{subtitle}</Text>}
    </Box>
    {action}
  </Flex>
);

export default PageHeader;
