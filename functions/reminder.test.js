const test = require("node:test");
const assert = require("node:assert/strict");
const { isDue, describe } = require("./reminder");

const cairo = {
  time: "07:30",
  days: [0, 1, 2, 3, 4],
  timeZone: "Africa/Cairo",
  tokens: ["t"],
};
// Monday 28 Sept 2026, 07:40 in Cairo (UTC+3 in summer time)
const mondayMorning = new Date("2026-09-28T04:40:00Z");

test("due just after the time, on a picked day", () => {
  assert.equal(isDue(cairo, mondayMorning), true);
});

test("not before the time, nor over an hour after", () => {
  assert.equal(isDue(cairo, new Date("2026-09-27T04:20:00Z")), false);
  assert.equal(isDue(cairo, new Date("2026-09-27T05:40:00Z")), false);
});

test("not on a day off (Friday)", () => {
  assert.equal(isDue(cairo, new Date("2026-10-02T04:40:00Z")), false);
});

test("only once a day for the same time", () => {
  assert.equal(
    isDue({ ...cairo, lastSentFor: "2026-09-28 07:30" }, mondayMorning),
    false
  );
});

test("a changed time goes out again the same day", () => {
  const later = { ...cairo, time: "07:40", lastSentFor: "2026-09-28 07:30" };
  assert.equal(isDue(later, new Date("2026-09-28T04:45:00Z")), true);
});

test("not without a device", () => {
  assert.equal(isDue({ ...cairo, tokens: [] }, mondayMorning), false);
});

const weather = { temp: 9, description: "light rain" };
const coat = { title: "Camel overcoat", maxTemperature: 10 };
const blazer = { title: "Navy blazer", maxTemperature: 18 };

test("jacket lines", () => {
  assert.equal(
    describe({ number: 3, weather, jackets: [coat, blazer] }).body,
    "9° and light rain — two jackets would suit. Tap to choose."
  );
  assert.equal(
    describe({
      number: 3,
      weather: { ...weather, temp: 15 },
      jackets: [coat, blazer],
    }).body,
    "15° and light rain — your Navy blazer would suit."
  );
  assert.equal(
    describe({ number: 3, weather: { ...weather, temp: 25 }, jackets: [coat] })
      .body,
    "25° and light rain — no jacket needed."
  );
  assert.equal(
    describe({ number: 3, weather, jackets: [coat], chosen: coat }).body,
    "9° and light rain. With your Camel overcoat."
  );
  assert.equal(
    describe({ number: 3, weather, jackets: [coat], chosen: false }).body,
    "9° and light rain. No jacket today."
  );
  assert.deepEqual(describe({ number: 2, jackets: [] }), {
    title: "Today: Outfit No. 2",
    body: "Tap to see what's laid out.",
  });
});
