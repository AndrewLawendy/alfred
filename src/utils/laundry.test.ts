import {
  DEFAULT_LIMITS,
  activeIndex,
  byId,
  cleanCount,
  hamperPieces,
  inHamper,
  isInHamper,
  localDate,
  notToday,
  pick,
  sinceLabel,
  undoOf,
  upNext,
  toHamper,
  washed,
  wearableFrom,
} from "utils/laundry";
import type { Queued } from "utils/laundry";

const item = (
  id: string,
  type: "shirt" | "pants" | "belt" | "shoes" | "jacket",
  wears?: number,
  lastWornOn?: string
) => ({ id, type, wears, lastWornOn });

const outfit = (
  id: string,
  order: number,
  shirt: string,
  pants: string,
  extra: Partial<Queued> = {}
): Queued => ({
  id,
  order,
  active: false,
  shirt: { id: shirt },
  pants: { id: pants },
  ...extra,
});

const limits = DEFAULT_LIMITS;

test("local dates are YYYY-MM-DD", () => {
  expect(localDate(new Date(2026, 9, 3, 23, 59))).toBe("2026-10-03");
});

test("an item is in the hamper once its wears reach its type's limit", () => {
  expect(isInHamper(item("s", "shirt", 1), limits)).toBe(true);
  expect(isInHamper(item("s", "shirt", 0), limits)).toBe(false);
  expect(isInHamper(item("s", "shirt"), limits)).toBe(false);
  expect(isInHamper(item("p", "pants", 2), limits)).toBe(false);
  expect(isInHamper(item("p", "pants", 3), limits)).toBe(true);
});

test("belts, shoes and jackets never go in the hamper", () => {
  expect(isInHamper(item("b", "belt", 99), limits)).toBe(false);
  expect(isInHamper(item("j", "jacket", 99), limits)).toBe(false);
});

test("lowering a limit puts items in the hamper immediately, raising takes them out", () => {
  const chinos = item("p", "pants", 2);
  expect(isInHamper(chinos, { ...limits, pants: 2 })).toBe(true);
  expect(isInHamper(item("p", "pants", 3), { ...limits, pants: 4 })).toBe(
    false
  );
});

test("hamper pieces skip slots whose item is missing", () => {
  const items = byId([item("s1", "shirt", 1)]);
  expect(hamperPieces(outfit("a", 0, "s1", "gone"), items, limits)).toEqual([
    items.get("s1"),
  ]);
  expect(hamperPieces(outfit("b", 1, "gone", "gone"), items, limits)).toEqual(
    []
  );
});

test("wearable outfits are found from a position, going round once", () => {
  const items = byId([
    item("s1", "shirt", 1),
    item("s2", "shirt"),
    item("p", "pants"),
  ]);
  const outfits = [
    outfit("a", 0, "s1", "p"),
    outfit("b", 1, "s2", "p"),
    outfit("c", 2, "s1", "p"),
  ];
  expect(wearableFrom(outfits, 0, items, limits)?.id).toBe("b");
  expect(wearableFrom(outfits, 2, items, limits)?.id).toBe("b");
  expect(cleanCount(outfits, items, limits)).toBe(1);
});

test("no wearable outfit gives undefined; the outfit on screen is the active one", () => {
  const items = byId([item("s1", "shirt", 1), item("p", "pants", 3)]);
  const outfits = [
    outfit("a", 0, "s1", "p"),
    outfit("b", 1, "s1", "p2", { active: true }),
  ];
  expect(wearableFrom(outfits, 0, items, limits)).toBeUndefined();
  expect(activeIndex(outfits)).toBe(1);
  expect(activeIndex([outfit("x", 0, "s", "p")])).toBe(0);
});

test("the hamper lists items oldest first; washing and hamper set wears", () => {
  const items = [
    item("new", "shirt", 1, "2026-10-02"),
    item("old", "pants", 3, "2026-09-28"),
    item("clean", "shirt", 0),
  ];
  expect(inHamper(items, limits).map(({ id }) => id)).toEqual(["old", "new"]);
  expect(washed(items[0])).toEqual({ id: "new", changes: { wears: 0 } });
  expect(toHamper(item("p", "pants", 1), limits, "2026-10-03")).toEqual({
    id: "p",
    changes: { wears: 3, lastWornOn: "2026-10-03" },
  });
});

const TUE = "2026-09-29";
const WED = "2026-09-30";
const THU = "2026-10-01";
const SUN = "2026-10-04";
const MON = "2026-09-28";

// The spec's queue: A → B → C → D, each with its own shirt and shared pants;
// A is on screen, picked Monday
const queue = (extra: Record<string, Partial<Queued>> = {}) =>
  ["a", "b", "c", "d"].map((id, order) =>
    outfit(id, order, `s${id}`, "p", {
      active: id === "a",
      ...(id === "a" && { pickedOn: MON }),
      ...extra[id],
    })
  );
const wardrobe = (wears: Record<string, number> = {}) =>
  byId(
    ["sa", "sb", "sc", "sd"]
      .map((id) => item(id, "shirt", wears[id]))
      .concat(item("p", "pants", wears.p))
  );
// Firestore after the writes, in rotation order
const apply = (outfits: Queued[], updates: { id: string; changes: object }[]) =>
  outfits
    .map((o) => ({ ...o, ...updates.find(({ id }) => id === o.id)?.changes }))
    .sort((a, b) => a.order - b.order) as Queued[];
const onScreen = (outfits: Queued[]) =>
  outfits.find(({ active }) => active)?.id;

test("Pick today's counts the outfit on screen and brings up the next", () => {
  const result = pick({
    outfits: queue(),
    items: wardrobe({ p: 1 }),
    limits,
    date: TUE,
  });
  expect(result.items).toEqual([
    { id: "sa", changes: { wears: 1, lastWornOn: MON } },
    { id: "p", changes: { wears: 2, lastWornOn: MON } },
  ]);
  expect(result.outfits).toEqual([
    { id: "a", changes: { active: false } },
    { id: "b", changes: { active: true, pickedOn: TUE } },
  ]);
});

test("days off cost nothing: the wear is dated to the day it was picked", () => {
  const outfits = queue({ a: { pickedOn: THU } });
  expect(
    pick({ outfits, items: wardrobe(), limits, date: SUN }).items[0]
  ).toEqual({
    id: "sa",
    changes: { wears: 1, lastWornOn: THU },
  });
  const unpicked = queue({ a: { pickedOn: undefined } });
  expect(
    pick({ outfits: unpicked, items: wardrobe(), limits, date: SUN }).items[0]
      .changes.lastWornOn
  ).toBe(SUN);
});

test("a count never goes past the limit", () => {
  expect(
    pick({ outfits: queue(), items: wardrobe({ p: 5 }), limits, date: TUE })
      .items[1]
  ).toEqual({
    id: "p",
    changes: { wears: 3, lastWornOn: MON },
  });
});

test("sick day: Not today counts nothing, and the skipped outfit comes right after", () => {
  const items = wardrobe();
  const skipped = notToday({ outfits: queue(), items, limits, date: TUE });
  expect(skipped).toEqual([
    { id: "a", changes: { active: false, heldTurn: true } },
    { id: "b", changes: { active: true, pickedOn: TUE } },
  ]);
  const tuesday = apply(queue(), skipped!);
  const wednesday = pick({ outfits: tuesday, items, limits, date: WED });
  expect(wednesday.items.map(({ id }) => id)).toEqual(["sb", "p"]);
  const after = apply(tuesday, wednesday.outfits);
  expect(after.map(({ id }) => id)).toEqual(["b", "a", "c", "d"]);
  expect(onScreen(after)).toBe("a");
});

test("browsing: skip A and B, wear C, and the order becomes C A B D with A next", () => {
  const items = wardrobe();
  let outfits = queue();
  outfits = apply(outfits, notToday({ outfits, items, limits, date: TUE })!);
  outfits = apply(outfits, notToday({ outfits, items, limits, date: TUE })!);
  expect(onScreen(outfits)).toBe("c");
  outfits = apply(outfits, pick({ outfits, items, limits, date: WED }).outfits);
  expect(outfits.map(({ id }) => id)).toEqual(["c", "a", "b", "d"]);
  expect(onScreen(outfits)).toBe("a");
  expect(outfits.some(({ heldTurn }) => heldTurn)).toBe(false);
});

test("Not today goes round the wearable outfits and back, never bouncing", () => {
  const items = wardrobe({ sb: 1 });
  let outfits = queue();
  const seen: (string | undefined)[] = [];
  for (let i = 0; i < 3; i++) {
    outfits = apply(outfits, notToday({ outfits, items, limits, date: TUE })!);
    seen.push(onScreen(outfits));
  }
  expect(seen).toEqual(["c", "d", "a"]);
  expect(outfits.some(({ heldTurn }) => heldTurn)).toBe(false);
});

test("Wear today jumps to a chosen outfit, and everything it jumped keeps its turn", () => {
  const items = wardrobe({ sd: 1 });
  let outfits = queue();
  const jump = notToday({ outfits, items, limits, date: TUE, to: "d" });
  expect(jump).toEqual([
    { id: "a", changes: { active: false, heldTurn: true } },
    { id: "d", changes: { active: true, pickedOn: TUE } },
  ]);
  outfits = apply(outfits, jump!);
  outfits = apply(outfits, pick({ outfits, items, limits, date: WED }).outfits);
  expect(outfits.map(({ id }) => id)).toEqual(["d", "a", "b", "c"]);
  expect(onScreen(outfits)).toBe("a");
  expect(
    notToday({ outfits, items, limits, date: WED, to: "a" })
  ).toBeUndefined();
});

test("Pick today's brings up the next outfit even with a piece in the hamper", () => {
  const result = pick({
    outfits: queue(),
    items: wardrobe({ sb: 1 }),
    limits,
    date: TUE,
  });
  expect(result.outfits[1]).toEqual({
    id: "b",
    changes: { active: true, pickedOn: TUE },
  });
});

test("nothing clean: Not today has nowhere to go, Pick today's still moves on", () => {
  const items = wardrobe({ p: 3 });
  expect(
    notToday({ outfits: queue(), items, limits, date: TUE })
  ).toBeUndefined();
  expect(
    pick({ outfits: queue(), items, limits, date: TUE }).outfits[1].id
  ).toBe("b");
});

test("a single outfit: Pick today's counts it and keeps it, Not today can't move", () => {
  const solo = [outfit("a", 0, "sa", "p", { active: true, pickedOn: MON })];
  const result = pick({ outfits: solo, items: wardrobe(), limits, date: TUE });
  expect(result.outfits).toEqual([{ id: "a", changes: { pickedOn: TUE } }]);
  expect(result.items).toHaveLength(2);
  expect(
    notToday({ outfits: solo, items: wardrobe(), limits, date: TUE })
  ).toBeUndefined();
});

test("the outfit left behind drops its jacket", () => {
  const outfits = queue({ a: { jacket: { id: "coat" } } });
  expect(
    pick({ outfits, items: wardrobe(), limits, date: TUE }).outfits[0]
  ).toEqual({
    id: "a",
    changes: { active: false, jacket: null },
  });
  expect(
    notToday({ outfits, items: wardrobe(), limits, date: TUE })![0]
  ).toEqual({
    id: "a",
    changes: { active: false, jacket: null, heldTurn: true },
  });
});

test("a pick skips a slot whose item was deleted", () => {
  const outfits = [
    outfit("a", 0, "gone", "p", { active: true }),
    outfit("b", 1, "sb", "p"),
  ];
  expect(
    pick({ outfits, items: wardrobe(), limits, date: TUE }).items.map(
      ({ id }) => id
    )
  ).toEqual(["p"]);
});

test("undo writes back every changed field, null where there was none", () => {
  const items = wardrobe({ p: 1 });
  let outfits = queue();
  outfits = apply(outfits, notToday({ outfits, items, limits, date: TUE })!);
  const result = pick({ outfits, items, limits, date: WED });
  expect(undoOf(outfits, result.outfits)).toEqual([
    { id: "b", changes: { order: 1, active: true } },
    {
      id: "a",
      changes: { order: 0, active: false, pickedOn: MON, heldTurn: true },
    },
  ]);
  expect(undoOf([...items.values()], result.items)).toEqual([
    { id: "sb", changes: { wears: null, lastWornOn: null } },
    { id: "p", changes: { wears: 1, lastWornOn: null } },
  ]);
});

test("up next is the outfit holding its turn, otherwise the one after today's", () => {
  expect(upNext(queue()).id).toBe("b");
  expect(
    upNext(
      queue({
        a: { active: false },
        c: { active: true },
        b: { heldTurn: true },
      })
    ).id
  ).toBe("b");
});

test("since labels use the weekday this week, the date before that", () => {
  expect(sinceLabel("2026-09-28", "2026-10-03")).toBe("Mon");
  expect(sinceLabel("2026-09-20", "2026-10-03")).toBe("20 Sept");
  expect(sinceLabel(undefined, "2026-10-03")).toBe("");
});
