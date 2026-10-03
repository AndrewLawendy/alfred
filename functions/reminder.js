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

// The latest start of this reminder's time: today, or yesterday when a late
// time's hour runs past midnight. Its date and weekday are the reminder's.
const occurrence = (reminder, now) => {
  const timeZone = reminder.timeZone || "UTC";
  const [hour, minute] = (reminder.time || "07:30").split(":").map(Number);
  const since =
    (localParts(now, timeZone).minutes - (hour * 60 + minute) + 1440) % 1440;
  return {
    since,
    ...localParts(new Date(now.getTime() - since * 60000), timeZone),
  };
};

const sentKey = (reminder, now) =>
  `${occurrence(reminder, now).date} ${reminder.time || "07:30"}`;

const isDue = (reminder, now) => {
  if (!reminder.tokens || reminder.tokens.length === 0) return false;
  const { since, day } = occurrence(reminder, now);
  return (
    (reminder.days || []).includes(day) &&
    since < WINDOW_MINUTES &&
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
    ({ maxTemperature }) => Number(maxTemperature) >= Math.round(weather.temp)
  );
  if (suitable.length === 0) return `${sky} — no jacket needed.`;
  if (suitable.length === 1)
    return `${sky} — your ${suitable[0].title} would suit.`;
  const count = numbers[suitable.length] || String(suitable.length);
  return `${sky} — ${count.toLowerCase()} jackets would suit.`;
};

// ponytail: repeats isInHamper, cleanCount and upNext from
// src/utils/laundry.ts, as the functions are CommonJS outside the Vite build.
// Change both together; reminder.test.js pins this copy.
const isInHamper = (item, limits) => {
  const limit =
    item && (item.type === "shirt" || item.type === "pants")
      ? limits[item.type]
      : undefined;
  return limit !== undefined && (item.wears ?? 0) >= limit;
};

const cleanCount = (outfits, items, limits) =>
  outfits.filter((outfit) =>
    ["shirt", "pants"].every(
      (slot) => !isInHamper(items[outfit[slot]?.id], limits)
    )
  ).length;

const isWearable = (outfit, items, limits) =>
  ["shirt", "pants"].every(
    (slot) => !isInHamper(items[outfit[slot]?.id], limits)
  );

// What Next outfit brings up: the outfit holding its turn, otherwise the one
// after today's, skipping any with a piece in the hamper once today's outfit
// has counted its wear. With nothing clean, the next one anyway.
const upNext = (outfits, items, limits) => {
  const index = Math.max(
    0,
    outfits.findIndex(({ active }) => active)
  );
  const current = outfits[index];
  if (outfits.length === 1) return current;
  const worn = { ...items };
  ["shirt", "pants"].forEach((slot) => {
    const id = current[slot]?.id;
    const limit = id && worn[id] ? limits[worn[id].type] : undefined;
    if (limit === undefined || !["shirt", "pants"].includes(worn[id].type)) {
      return;
    }
    worn[id] = {
      ...worn[id],
      wears: Math.min(limit, (worn[id].wears ?? 0) + 1),
    };
  });
  const holder = outfits.find(({ heldTurn }) => heldTurn);
  const start =
    holder && holder !== current ? outfits.indexOf(holder) : index + 1;
  const at = (i) => outfits[i % outfits.length];
  for (let step = 0; step < outfits.length; step++) {
    const outfit = at(start + step);
    if (outfit !== current && isWearable(outfit, worn, limits)) return outfit;
  }
  return at(start) === current ? at(start + 1) : at(start);
};

const laundryLine = ({ clean, hasHamper }) =>
  !hasHamper || clean === undefined || clean > 2
    ? ""
    : clean === 0
      ? "Nothing's fully clean — laundry day?"
      : `Only ${clean} clean outfit${clean === 1 ? "" : "s"} left — laundry day?`;

// The morning nudge: move on to the next outfit (the one up next, named piece by
// piece), the weather, and a laundry line when clean outfits run low. Once
// picked, or with a single outfit, it describes the outfit on screen.
const describe = ({
  isNudge,
  pieces,
  weather,
  jackets,
  chosen,
  clean,
  hasHamper,
}) => {
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
      laundryLine({ clean, hasHamper }),
    ]
      .filter(Boolean)
      .join("\n"),
  };
};

module.exports = {
  localParts,
  isDue,
  sentKey,
  describe,
  upNext,
  cleanCount,
  isInHamper,
};
