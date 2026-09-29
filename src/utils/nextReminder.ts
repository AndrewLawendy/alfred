const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// When the reminder goes out next, in words: "today at 07:30",
// "tomorrow at 07:30", "on Sunday at 07:30", or null with no days picked
export const nextReminder = (now: Date, time: string, days: number[]) => {
  if (days.length === 0) return null;
  const [hour, minute] = time.split(":").map(Number);
  for (let ahead = 0; ahead <= 7; ahead++) {
    const date = new Date(now);
    date.setDate(now.getDate() + ahead);
    date.setHours(hour, minute, 0, 0);
    if (date > now && days.includes(date.getDay())) {
      const when =
        ahead === 0
          ? "today"
          : ahead === 1
            ? "tomorrow"
            : `on ${dayNames[date.getDay()]}`;
      return `${when} at ${time}`;
    }
  }
  return null;
};

// "Sun–Thu", "Fri–Sun", "every day", or a list like "Sun, Tue"
export const describeDays = (days: number[]) => {
  const picked = new Set(days);
  if (picked.size === 7) return "every day";
  const short = (day: number) => dayNames[day].slice(0, 3);
  // Start from a picked day whose day before isn't, so a run across the
  // weekend reads in order
  const week = [0, 1, 2, 3, 4, 5, 6];
  const first =
    week.find((day) => picked.has(day) && !picked.has((day + 6) % 7)) ?? 0;
  const ordered = week
    .map((i) => (first + i) % 7)
    .filter((day) => picked.has(day));
  const isRun = ordered.every(
    (day, i) => i === 0 || day === (ordered[i - 1] + 1) % 7
  );
  if (isRun && ordered.length > 2)
    return `${short(ordered[0])}–${short(ordered[ordered.length - 1])}`;
  return ordered.map(short).join(", ");
};
