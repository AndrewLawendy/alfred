// The big page title shrinks into the slim bar as it scrolls away, following
// the finger: the bar's own small title is drawn over the big one, then eased
// into place as the page scrolls on.

// 0 while the big title rests where it is (or below the bar), 1 once its top
// is a title's height past the bar's bottom edge. A title that rests partly
// under the bar starts from its resting place, so nothing moves until scrolled.
export const morphProgress = ({
  titleTop,
  restTop = Infinity,
  barBottom,
  distance,
}: {
  titleTop: number;
  // Where the title's top is with the page scrolled to the top
  restTop?: number;
  barBottom: number;
  distance: number;
}) => {
  const start = Math.min(restTop, barBottom);
  const end = barBottom - distance;
  return Math.min(1, Math.max(0, (start - titleTop) / (start - end || 1)));
};

// Where to draw the small title: over the big one (offset by dx, dy and
// scaled up) at 0, in its own place at 1
export const flyerTransform = (
  progress: number,
  { dx, dy, scale }: { dx: number; dy: number; scale: number }
) => {
  const rest = 1 - progress;
  return `translate(${dx * rest}px, ${dy * rest}px) scale(${1 + (scale - 1) * rest})`;
};
