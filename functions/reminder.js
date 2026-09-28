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

// Title and body, e.g. "Today: Outfit No. 3" / "9° and light rain — two
// jackets would suit. Tap to choose."
const describe = ({ number, weather, jackets, chosen }) => {
  const title = `Today: Outfit No. ${number}`;
  if (!weather) return { title, body: "Tap to see what's laid out." };

  const sky = `${Math.round(weather.temp)}° and ${weather.description}`;
  if (chosen) return { title, body: `${sky}. With your ${chosen.title}.` };
  if (chosen === false) return { title, body: `${sky}. No jacket today.` };
  if (jackets.length === 0) return { title, body: `${sky}.` };

  const suitable = jackets.filter(
    ({ maxTemperature }) => maxTemperature >= weather.temp
  );
  if (suitable.length === 0)
    return { title, body: `${sky} — no jacket needed.` };
  if (suitable.length === 1)
    return { title, body: `${sky} — your ${suitable[0].title} would suit.` };
  const count = numbers[suitable.length] || String(suitable.length);
  return {
    title,
    body: `${sky} — ${count.toLowerCase()} jackets would suit. Tap to choose.`,
  };
};

module.exports = { localParts, isDue, sentKey, describe };
