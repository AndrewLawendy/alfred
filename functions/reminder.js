// Pure rules for the morning reminder, kept apart from Firebase so they can
// be tested with `npm test`.

// The reminder's local date, weekday (0 = Sunday) and minutes since midnight
const localParts = (now, timeZone) => {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .map(({ type, value }) => [type, value])
  );
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    day: days.indexOf(parts.weekday),
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
};

// Due once a day per time, on one of its days, within an hour after its time.
// The hour covers a late or skipped scheduler run; lastSentFor ("date time")
// stops a second send, yet lets a changed time go out again that day.
const WINDOW_MINUTES = 60;

const sentKey = (reminder, now) =>
  `${localParts(now, reminder.timeZone || "UTC").date} ${
    reminder.time || "07:30"
  }`;

const isDue = (reminder, now) => {
  if (!reminder.tokens || reminder.tokens.length === 0) return false;
  const { day, minutes } = localParts(now, reminder.timeZone || "UTC");
  const [hour, minute] = (reminder.time || "07:30").split(":").map(Number);
  const start = hour * 60 + minute;
  return (
    (reminder.days || []).includes(day) &&
    minutes >= start &&
    minutes < start + WINDOW_MINUTES &&
    reminder.lastSentFor !== sentKey(reminder, now)
  );
};

const numbers = ["No", "One", "Two", "Three", "Four", "Five", "Six"];

// The weather and what it means for a jacket, e.g. "9° and light rain — two
// jackets would suit". The jacket already chosen only counts when the outfit
// stays (after Next, a new jacket is chosen for the new outfit).
const weatherLine = ({ weather, jackets, chosen }) => {
  if (!weather) return "";
  const sky = `${Math.round(weather.temp)}° and ${weather.description}`;
  if (chosen) return `${sky} — with your ${chosen.title}.`;
  if (chosen === false) return `${sky} — no jacket today.`;
  if (jackets.length === 0) return `${sky}.`;

  const suitable = jackets.filter(
    ({ maxTemperature }) => maxTemperature >= weather.temp
  );
  if (suitable.length === 0) return `${sky} — no jacket needed.`;
  if (suitable.length === 1)
    return `${sky} — your ${suitable[0].title} would suit.`;
  const count = numbers[suitable.length] || String(suitable.length);
  return `${sky} — ${count.toLowerCase()} jackets would suit.`;
};

// The morning nudge: move on to the next outfit (named piece by piece), plus
// the weather. With a single outfit there's nothing to move on to.
const describe = ({ isNudge, pieces, weather, jackets, chosen }) => {
  const outfit = pieces.join(", ");
  const firstLine = !outfit
    ? "Tap to see it."
    : isNudge
    ? `Up next: ${outfit}.`
    : `${outfit}.`;
  return {
    title: isNudge ? "Time for the next outfit" : "Your outfit is laid out",
    body: [
      firstLine,
      weatherLine({ weather, jackets, chosen: isNudge ? undefined : chosen }),
    ]
      .filter(Boolean)
      .join("\n"),
  };
};

module.exports = { localParts, isDue, sentKey, describe };
