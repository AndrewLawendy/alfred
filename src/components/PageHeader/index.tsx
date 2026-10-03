import { ReactNode, useEffect, useRef, useState } from "react";
import { Box, Flex, Heading, Text } from "@chakra-ui/react";

import { flyerTransform, morphProgress } from "./morph";

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

// Each page opens with its own large serif title rather than an app bar. As
// it scrolls away it shrinks into a slim glass bar, following the finger, and
// the bar keeps the page name and its main button at the top. With reduced
// motion the bar simply fades in.
const PageHeader = ({
  title,
  eyebrow,
  description,
  action,
  titleSize = "4xl",
}: PageHeaderProps) => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const glassRef = useRef<HTMLDivElement>(null);
  const flyerRef = useRef<HTMLParagraphElement>(null);
  const barActionRef = useRef<HTMLDivElement>(null);
  const pageActionRef = useRef<HTMLDivElement>(null);
  const [isCompact, setCompact] = useState(false);

  useEffect(() => {
    const big = titleRef.current;
    const bar = barRef.current;
    const glass = glassRef.current;
    const flyer = flyerRef.current;
    if (!big || !bar || !glass || !flyer) return;
    const isReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const barAction = barActionRef.current;
    const pageAction = pageActionRef.current;
    // Moving with the finger, the swap must be instant; a fade only without it
    flyer.style.transition = isReduced ? "opacity 0.15s" : "none";
    if (barAction) {
      barAction.style.transition = isReduced
        ? "opacity 0.15s, visibility 0.15s"
        : "none";
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const from = big.getBoundingClientRect();
      const raw = morphProgress({
        titleTop: from.top,
        barBottom: bar.getBoundingClientRect().bottom,
        distance: from.height || 1,
      });
      const progress = isReduced ? Math.floor(raw) : raw;
      // The small title's own place, measured without the morph applied
      flyer.style.transform = "none";
      const home = flyer.getBoundingClientRect();
      const isMoving = progress > 0 && !isReduced;
      flyer.style.transform = isMoving
        ? flyerTransform(progress, {
            dx: from.left - home.left,
            dy: from.top - home.top,
            scale: from.height / (home.height || 1),
          })
        : "none";
      flyer.style.opacity = progress > 0 ? "1" : "0";
      // The small title stands in for the big one while it moves
      big.style.opacity = isMoving ? "0" : "";
      glass.style.opacity = String(
        isReduced ? progress : Math.max(0, progress * 2 - 1)
      );
      // The main button travels up with the title, from its place beside it
      if (barAction && pageAction) {
        barAction.style.transform = "none";
        const spot = barAction.getBoundingClientRect();
        const start = pageAction.getBoundingClientRect();
        barAction.style.transform = isMoving
          ? flyerTransform(progress, {
              dx: start.left - spot.left,
              dy: start.top - spot.top,
              scale: 1,
            })
          : "none";
        barAction.style.opacity = progress > 0 ? "1" : "0";
        // Hidden also takes the button out of the tab order
        barAction.style.visibility = progress > 0 ? "visible" : "hidden";
        pageAction.style.opacity = isMoving ? "0" : "";
      }
      setCompact(progress >= 1);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      big.style.opacity = "";
      if (pageAction) pageAction.style.opacity = "";
    };
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
          // Clicks pass through to the page until the bar has formed
          pointerEvents: isCompact ? "auto" : "none",
        }}
      >
        <Box
          ref={glassRef}
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: -1,
            opacity: 0,
            backgroundColor: "pageGlass",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid",
            borderColor: "line",
            transition: "opacity 0.15s",
          }}
        />
        <Text
          ref={flyerRef}
          noOfLines={1}
          sx={{
            flex: 1,
            fontFamily: "heading",
            fontSize: "xl",
            // As the big title's, so its scale matches the font sizes
            lineHeight: 1.15,
            transformOrigin: "left top",
            opacity: 0,
            willChange: "transform",
          }}
        >
          {title}
        </Text>
        {action && (
          <Box
            ref={barActionRef}
            data-testid="compact-action"
            sx={{ flexShrink: 0, opacity: 0, visibility: "hidden" }}
          >
            {action}
          </Box>
        )}
      </Flex>

      <Box sx={{ mb: 5 }}>
        <Flex sx={{ alignItems: "flex-end", gap: 3 }}>
          <Box sx={{ flex: 1, minW: 0 }}>
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            <Heading
              ref={titleRef}
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
          {action && (
            <Box
              ref={pageActionRef}
              data-testid="page-action"
              sx={{ flexShrink: 0 }}
            >
              {action}
            </Box>
          )}
        </Flex>
        {description && (
          <Text sx={{ mt: 3, color: "muted" }}>{description}</Text>
        )}
      </Box>
    </>
  );
};

export default PageHeader;
