import { ReactNode, useEffect, useRef, useState } from "react";
import { Box, Flex, Heading, Text } from "@chakra-ui/react";

type PageHeaderProps = {
  title: ReactNode;
  // Small caps line above the title, e.g. the date
  eyebrow?: ReactNode;
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
      color: "muted",
    }}
  >
    {children}
  </Text>
);

// The slim bar that takes over once the big title has scrolled away
export const COMPACT_BAR_HEIGHT = "3.25rem";
// The header's bottom margin (mb: 5), so the bar is in before anything that
// sticks under it (the Wardrobe tabs) reaches it
const HEADER_GAP = 20;

// Each page opens with its own large serif title rather than an app bar. Once
// that scrolls away, a slim glass bar keeps the page name and its main button
// at the top, like the bottom nav.
const PageHeader = ({
  title,
  eyebrow,
  description,
  action,
  titleSize = "4xl",
}: PageHeaderProps) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [isCompact, setCompact] = useState(false);

  useEffect(() => {
    if (!headerRef.current || !barRef.current) return;
    // The bar sits under the status bar, so measure where it ends
    const barBottom = barRef.current.getBoundingClientRect().bottom;
    const observer = new IntersectionObserver(
      ([entry]) => setCompact(!entry.isIntersecting),
      { rootMargin: `-${Math.round(barBottom + HEADER_GAP)}px 0px 0px 0px` }
    );
    observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Flex
        ref={barRef}
        data-testid="compact-header"
        aria-hidden={isCompact ? undefined : true}
        sx={{
          position: "fixed",
          top: "env(safe-area-inset-top)",
          left: 0,
          right: 0,
          zIndex: "sticky",
          h: COMPACT_BAR_HEIGHT,
          px: 3,
          gap: 3,
          alignItems: "center",
          backgroundColor: "pageGlass",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid",
          borderColor: "line",
          opacity: isCompact ? 1 : 0,
          // Hidden also takes its button out of the tab order
          visibility: isCompact ? "visible" : "hidden",
          transition: "opacity 0.15s, visibility 0.15s",
        }}
      >
        <Text
          noOfLines={1}
          sx={{ flex: 1, fontFamily: "heading", fontSize: "xl" }}
        >
          {title}
        </Text>
        {action}
      </Flex>

      <Box ref={headerRef} sx={{ mb: 5 }}>
        <Flex sx={{ alignItems: "flex-end", gap: 3 }}>
          <Box sx={{ flex: 1, minW: 0 }}>
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            <Heading
              as="h1"
              noOfLines={1}
              sx={{
                fontSize: titleSize,
                lineHeight: 1.15,
                mt: eyebrow ? 1 : 0,
              }}
            >
              {title}
            </Heading>
          </Box>
          {action}
        </Flex>
        {description && (
          <Text sx={{ mt: 3, color: "muted" }}>{description}</Text>
        )}
      </Box>
    </>
  );
};

export default PageHeader;
