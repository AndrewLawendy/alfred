import { noticeDuration } from "hooks/useNotice";

test("a notice with an action (Undo) stays up long enough to reach it", () => {
  expect(noticeDuration({ title: "Saved" })).toBe(5000);
  expect(
    noticeDuration({
      title: "Counted",
      action: { label: "Undo", onClick: () => {} },
    })
  ).toBe(10000);
});
