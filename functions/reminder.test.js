const test = require("node:test");
const assert = require("node:assert/strict");
const { isDue, describe, upNext, cleanCount } = require("./reminder");

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

const pieces = [
  "White oxford",
  "Brown leather",
  "Charcoal wool",
  "Brown oxfords",
];

test("nudges to the next outfit, naming its pieces and the weather", () => {
  assert.deepEqual(
    describe({ isNudge: true, pieces, weather, jackets: [coat, blazer] }),
    {
      title: "Time to pick today's outfit",
      body:
        "Up next: White oxford, Brown leather, Charcoal wool, Brown oxfords.\n" +
        "9° and light rain — two jackets would suit.",
    }
  );
});

test("a nudge ignores the jacket picked for the outfit being left", () => {
  const { body } = describe({
    isNudge: true,
    pieces,
    weather: { ...weather, temp: 15 },
    jackets: [coat, blazer],
    chosen: coat,
  });
  assert.match(body, /15° and light rain — your Navy blazer would suit\.$/);
});

test("a single outfit is laid out, with its chosen jacket", () => {
  const { title, body } = describe({
    isNudge: false,
    pieces,
    weather,
    jackets: [coat],
    chosen: coat,
  });
  assert.equal(title, "Your outfit is laid out");
  assert.match(body, /with your Camel overcoat\.$/);
});

test("warm, no weather, and missing pieces", () => {
  assert.match(
    describe({
      isNudge: true,
      pieces,
      weather: { ...weather, temp: 25 },
      jackets: [coat],
    }).body,
    /no jacket needed\.$/
  );
  assert.equal(
    describe({ isNudge: true, pieces: [], jackets: [] }).body,
    "Tap to see it."
  );
});

test("a late-evening time still goes out just after midnight, once", () => {
  // Sunday 23:50 in Cairo; the run at 00:10 Monday is still in its hour
  const late = { ...cairo, time: "23:50", days: [0] };
  const afterMidnight = new Date("2026-09-27T21:10:00Z");
  assert.equal(isDue(late, afterMidnight), true);
  assert.equal(
    isDue({ ...late, lastSentFor: "2026-09-27 23:50" }, afterMidnight),
    false
  );
});

const wardrobe = {
  s1: { type: "shirt", wears: 1 },
  s2: { type: "shirt" },
  p: { type: "pants", wears: 3 },
};
const limits = { shirt: 1, pants: 3 };
const fit = (id, shirt, pants, extra = {}) => ({
  id,
  shirt: { id: shirt },
  pants: { id: pants },
  ...extra,
});

test("up next is the outfit holding its turn, otherwise the one after today's", () => {
  assert.equal(
    upNext([fit("a", "s2", "q", { active: true }), fit("b", "s2", "q")]).id,
    "b"
  );
  assert.equal(
    upNext([
      fit("a", "s2", "q", { heldTurn: true }),
      fit("b", "s2", "q", { active: true }),
      fit("c", "s2", "q"),
    ]).id,
    "a"
  );
});

test("clean outfits leave out any with a piece in the hamper", () => {
  const outfits = [
    fit("a", "s1", "q"),
    fit("b", "s2", "q"),
    fit("c", "s2", "p"),
  ];
  assert.equal(cleanCount(outfits, wardrobe, limits), 1);
});

test("laundry line only at 2 or fewer clean outfits with something in the hamper", () => {
  const base = { isNudge: true, pieces: ["Navy shirt"], jackets: [] };
  assert.match(
    describe({ ...base, clean: 2, hasHamper: true }).body,
    /Only 2 clean outfits left — laundry day\?/
  );
  assert.match(
    describe({ ...base, clean: 0, hasHamper: true }).body,
    /Nothing's fully clean — laundry day\?/
  );
  assert.doesNotMatch(
    describe({ ...base, clean: 2, hasHamper: false }).body,
    /laundry/
  );
  assert.doesNotMatch(
    describe({ ...base, clean: 3, hasHamper: true }).body,
    /laundry/
  );
  assert.equal(describe(base).title, "Time to pick today's outfit");
});
