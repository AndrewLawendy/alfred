// The big page title shrinks into the slim bar as it scrolls away, following
// the finger: the bar's own small title is drawn over the big one, then eased
// into place as the page scrolls on.

// 0 while the big title is below the bar, 1 once it has scrolled a title's
// height past the bar's bottom edge
export const morphProgress = ({
  titleTop,
  barBottom,
  distance,
}: {
  titleTop: number;
  barBottom: number;
  distance: number;
}) => Math.min(1, Math.max(0, (barBottom - titleTop) / distance));

// Where to draw the small title: over the big one (offset by dx, dy and
// scaled up) at 0, in its own place at 1
export const flyerTransform = (
  progress: number,
  { dx, dy, scale }: { dx: number; dy: number; scale: number }
) => {
  const rest = 1 - progress;
  return `translate(${dx * rest}px, ${dy * rest}px) scale(${1 + (scale - 1) * rest})`;
};
