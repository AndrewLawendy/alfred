import { ReactNode } from "react";
import { Box, Flex, Heading, Text } from "@chakra-ui/react";

type PageHeaderProps = {
  title: ReactNode;
  // Small caps line above the title, e.g. the date
  eyebrow?: string;
  // A sentence under the title row
  description?: string;
  // A button beside the title, e.g. New
  action?: ReactNode;
  // Home's greeting is longer than a page name
  titleSize?: string;
};

export const Eyebrow = ({ children }: { children: ReactNode }) => (
  <Text
    sx={{
      fontSize: "xs",
      fontWeight: "semibold",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "gray.600",
    }}
  >
    {children}
  </Text>
);

// Each page opens with its own large serif title rather than an app bar
const PageHeader = ({
  title,
  eyebrow,
  description,
  action,
  titleSize = "4xl",
}: PageHeaderProps) => (
  <Box sx={{ mb: 5 }}>
    <Flex sx={{ alignItems: "flex-end", gap: 3 }}>
      <Box sx={{ flex: 1, minW: 0 }}>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <Heading
          as="h1"
          noOfLines={1}
          sx={{ fontSize: titleSize, lineHeight: 1.15, mt: eyebrow ? 1 : 0 }}
        >
          {title}
        </Heading>
      </Box>
      {action}
    </Flex>
    {description && (
      <Text sx={{ mt: 3, color: "gray.600" }}>{description}</Text>
    )}
  </Box>
);

export default PageHeader;
