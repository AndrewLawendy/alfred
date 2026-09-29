import { describeDays, nextReminder } from "utils/nextReminder";

const workWeek = [0, 1, 2, 3, 4];
// Monday 28 Sept 2026, local time
const monday = (hour: number, minute = 0) =>
  new Date(2026, 8, 28, hour, minute);

test("later today when the time hasn't passed", () => {
  expect(nextReminder(monday(6), "07:30", workWeek)).toBe("today at 07:30");
});

test("tomorrow once today's has passed", () => {
  expect(nextReminder(monday(8), "07:30", workWeek)).toBe("tomorrow at 07:30");
});

test("skips days off to the next picked day", () => {
  // Thursday 1 Oct after the time: Friday and Saturday are off
  expect(nextReminder(new Date(2026, 9, 1, 9), "07:30", workWeek)).toBe(
    "on Sunday at 07:30"
  );
});

test("no days, no reminder", () => {
  expect(nextReminder(monday(6), "07:30", [])).toBeNull();
});

test("days in words", () => {
  expect(describeDays(workWeek)).toBe("Sun–Thu");
  expect(describeDays([0, 1, 2, 3, 4, 5, 6])).toBe("every day");
  expect(describeDays([2, 0])).toBe("Sun, Tue");
});

test("a run across the weekend reads from its first day", () => {
  expect(describeDays([0, 5, 6])).toBe("Fri–Sun");
  expect(describeDays([0, 6])).toBe("Sat, Sun");
});
