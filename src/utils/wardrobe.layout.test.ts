import { layoutOf } from "utils/wardrobe";

const p = (id: string, type: string) => ({ id, type });
const ids = (pieces: { id: string }[]) => pieces.map(({ id }) => id);

test("pieces lay out the way you dress", () => {
  const layout = layoutOf([
    p("f", "shoes"),
    p("b", "bottom"),
    p("s", "accessory"),
    p("t", "top"),
    p("l", "layer"),
  ]);
  expect(ids(layout.main)).toEqual(["t", "b"]);
  expect(ids(layout.side)).toEqual(["l"]);
  expect(ids(layout.small)).toEqual(["f", "s"]);
});

test("a dress outfit and several accessories, in the order picked", () => {
  const layout = layoutOf([
    p("h", "accessory"),
    p("d", "dress"),
    p("g", "accessory"),
    p("f", "shoes"),
  ]);
  expect(ids(layout.main)).toEqual(["d"]);
  expect(ids(layout.small)).toEqual(["f", "h", "g"]);
});

test("a top and a dress together both stay in main", () => {
  expect(ids(layoutOf([p("d", "dress"), p("t", "top")]).main)).toEqual([
    "t",
    "d",
  ]);
});

test("old types lay out by their category", () => {
  const layout = layoutOf([p("b", "belt"), p("s", "shirt"), p("p", "pants")]);
  expect(ids(layout.main)).toEqual(["s", "p"]);
  expect(ids(layout.small)).toEqual(["b"]);
});
