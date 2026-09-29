import { ReactNode } from "react";
import { act } from "react-dom/test-utils";
import { renderHook } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";

import { setAppearance, useApplyAppearance } from "hooks/useAppearance";
import { appearanceManager } from "utils/appearance";

const wrapper = ({ children }: { children: ReactNode }) => (
  <ChakraProvider colorModeManager={appearanceManager}>
    {children}
  </ChakraProvider>
);

afterEach(() => {
  act(() => setAppearance("system"));
  vi.restoreAllMocks();
});

test("follows the phone only while the choice is System", () => {
  const phone = {
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
  vi.spyOn(window, "matchMedia").mockReturnValue(
    phone as unknown as MediaQueryList
  );

  renderHook(() => useApplyAppearance(), { wrapper });
  expect(phone.addEventListener).toHaveBeenCalledWith(
    "change",
    expect.any(Function)
  );

  act(() => setAppearance("dark"));
  expect(phone.removeEventListener).toHaveBeenCalledTimes(1);
  expect(phone.addEventListener).toHaveBeenCalledTimes(1);
});
