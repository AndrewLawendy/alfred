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

// "Sun–Thu", "every day", or a list like "Sun, Tue"
export const describeDays = (days: number[]) => {
  const sorted = [...days].sort();
  const short = (day: number) => dayNames[day].slice(0, 3);
  if (sorted.length === 7) return "every day";
  const isRun = sorted.every((day, i) => i === 0 || day === sorted[i - 1] + 1);
  if (isRun && sorted.length > 2)
    return `${short(sorted[0])}–${short(sorted[sorted.length - 1])}`;
  return sorted.map(short).join(", ");
};
