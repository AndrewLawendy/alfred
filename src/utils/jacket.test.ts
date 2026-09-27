import { jacketState } from "utils/jacket";
import { Jacket } from "utils/types";

const jacket = (id: string, maxTemperature: number) =>
  ({ id, title: id, maxTemperature } as Jacket);
const coat = jacket("coat", 10);
const blazer = jacket("blazer", 20);
const jackets = [coat, blazer];

test("cold with nothing chosen: prompt and offer both", () => {
  const state = jacketState(jackets, 8, null);
  expect(state.needsChoice).toBe(true);
  expect(state.options).toEqual([coat, blazer]);
  expect(state.jacket).toBeUndefined();
  expect(state.hasCard).toBe(true);
});

test("one suits: suggest it and still ask, since it may clash", () => {
  const state = jacketState(jackets, 15, undefined);
  expect(state.needsChoice).toBe(true);
  expect(state.jacket).toBe(blazer);
  expect(state.options).toEqual([blazer]);
  expect(state.hasCard).toBe(true);
});

test("a chosen jacket stays, and changeable, after the weather warms", () => {
  const state = jacketState(jackets, 25, coat);
  expect(state.jacket).toBe(coat);
  expect(state.options).toEqual([coat]);
  expect(state.hasCard).toBe(true);
  expect(state.needsChoice).toBe(false);
});

test("skipping keeps the card so the choice can be undone", () => {
  const state = jacketState(jackets, 8, false);
  expect(state.isSkipped).toBe(true);
  expect(state.jacket).toBeUndefined();
  expect(state.hasCard).toBe(true);
  expect(state.needsChoice).toBe(false);
});

test("warm with nothing chosen: no card", () => {
  expect(jacketState(jackets, 25, null).hasCard).toBe(false);
});

test("no weather: offer every jacket without prompting", () => {
  const state = jacketState(jackets, undefined, null);
  expect(state.options).toEqual(jackets);
  expect(state.needsChoice).toBe(false);
});
