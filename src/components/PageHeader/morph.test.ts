import { morphProgress, flyerTransform } from "components/PageHeader/morph";

test("the morph starts when the big title reaches the bar and ends a title-height later", () => {
  // The bar ends at 52px; the title is 40px tall
  expect(morphProgress({ titleTop: 120, barBottom: 52, distance: 40 })).toBe(0);
  expect(morphProgress({ titleTop: 52, barBottom: 52, distance: 40 })).toBe(0);
  expect(morphProgress({ titleTop: 32, barBottom: 52, distance: 40 })).toBe(
    0.5
  );
  expect(morphProgress({ titleTop: 12, barBottom: 52, distance: 40 })).toBe(1);
  expect(morphProgress({ titleTop: -300, barBottom: 52, distance: 40 })).toBe(
    1
  );
});

test("the small title sits on the big one at the start and in the bar at the end", () => {
  const at = { dx: 0, dy: 60, scale: 2 };
  expect(flyerTransform(0, at)).toBe("translate(0px, 60px) scale(2)");
  expect(flyerTransform(0.5, at)).toBe("translate(0px, 30px) scale(1.5)");
  expect(flyerTransform(1, at)).toBe("translate(0px, 0px) scale(1)");
});
