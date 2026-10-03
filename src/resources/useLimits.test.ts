import { renderHook } from "@testing-library/react";
import { useDocumentData } from "react-firebase-hooks/firestore";

import { setDoc } from "firebase/firestore";

import { saveLimits, useLimitsState } from "resources/useLimits";

vi.mock("hooks/useAuth", () => ({ default: () => [{ uid: "alice" }] }));
vi.mock("utils/firebase", () => ({
  auth: { currentUser: { uid: "alice" } },
  db: {},
}));
vi.mock("firebase/firestore", () => ({
  doc: () => ({}),
  setDoc: vi.fn(() => Promise.resolve()),
  serverTimestamp: () => "now",
}));
vi.mock("react-firebase-hooks/firestore", () => ({ useDocumentData: vi.fn() }));

const mockSettings = (data: unknown, isLoading: boolean) =>
  vi.mocked(useDocumentData).mockReturnValue([data, isLoading] as never);

test("limits say when they're still loading, so nothing counts with the defaults", () => {
  mockSettings(undefined, true);
  expect(renderHook(() => useLimitsState()).result.current.isLoading).toBe(
    true
  );
});

test("saved limits override the defaults once loaded", () => {
  mockSettings({ limits: { pants: 2 } }, false);
  expect(renderHook(() => useLimitsState()).result.current).toEqual({
    limits: { shirt: 1, pants: 2 },
    isLoading: false,
  });
});

test("saving one type's limit writes only that type, never the other's default", async () => {
  await saveLimits({ shirt: 2 });
  expect(vi.mocked(setDoc).mock.calls[0][1]).toEqual({
    user: "alice",
    limits: { shirt: 2 },
    updatedAt: "now",
  });
  expect(vi.mocked(setDoc).mock.calls[0][2]).toEqual({ merge: true });
});
