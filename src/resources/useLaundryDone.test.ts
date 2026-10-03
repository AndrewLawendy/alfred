import { renderHook } from "@testing-library/react";

import useLaundryDone from "resources/useLaundryDone";

const updateOutfits = vi.fn<(...args: unknown[]) => Promise<void>>(() =>
  Promise.resolve()
);
const toast = vi.fn();
vi.mock("resources/useUpdateOutfits", () => ({
  default: () => [updateOutfits, false],
}));
vi.mock("hooks/useNotice", () => ({ default: () => toast }));

const dirty = [
  { id: "shirt", type: "shirt" as const, wears: 1, lastWornOn: "2026-10-01" },
  { id: "pants", type: "pants" as const, wears: 3, lastWornOn: "2026-10-02" },
];

test("laundry done washes everything given and offers to undo it", async () => {
  const { result } = renderHook(() => useLaundryDone());
  await result.current(dirty);

  expect(updateOutfits).toHaveBeenCalledWith([], undefined, [
    { id: "shirt", changes: { wears: 0 } },
    { id: "pants", changes: { wears: 0 } },
  ]);
  const notice = toast.mock.calls[0][0] as {
    title: string;
    action: { label: string; onClick: () => void };
  };
  expect(notice.title).toBe("2 pieces washed");
  expect(notice.action.label).toBe("Undo");

  notice.action.onClick();
  expect(updateOutfits).toHaveBeenLastCalledWith([], undefined, [
    { id: "shirt", changes: { wears: 1 } },
    { id: "pants", changes: { wears: 3 } },
  ]);
});
