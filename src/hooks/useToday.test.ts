import { renderHook, waitFor } from "@testing-library/react";

import useToday from "hooks/useToday";

afterEach(() => vi.useRealTimers());

test("today moves on when the app comes back from the background", async () => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 9, 3, 22, 0));
  const { result } = renderHook(() => useToday());
  expect(result.current).toBe("2026-10-03");

  // Left open overnight, reopened the next morning
  vi.setSystemTime(new Date(2026, 9, 4, 7, 30));
  document.dispatchEvent(new Event("visibilitychange"));
  await waitFor(() => expect(result.current).toBe("2026-10-04"));
});
