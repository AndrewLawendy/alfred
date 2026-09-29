import {
  readAppearance,
  resolveAppearance,
  saveAppearance,
} from "utils/appearance";

const phoneIsDark = (isDark: boolean) =>
  vi.spyOn(window, "matchMedia").mockReturnValue({
    matches: isDark,
  } as MediaQueryList);

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

test("follows the phone by default", () => {
  expect(readAppearance()).toBe("system");
  phoneIsDark(true);
  expect(resolveAppearance("system")).toBe("dark");
  phoneIsDark(false);
  expect(resolveAppearance("system")).toBe("light");
});

test("a picked mode wins over the phone and is remembered", () => {
  phoneIsDark(true);
  saveAppearance("light");
  expect(readAppearance()).toBe("light");
  expect(resolveAppearance(readAppearance())).toBe("light");
});

test("going back to System forgets the pick", () => {
  saveAppearance("dark");
  saveAppearance("system");
  expect(localStorage.getItem("alfred-appearance")).toBeNull();
  expect(readAppearance()).toBe("system");
});
