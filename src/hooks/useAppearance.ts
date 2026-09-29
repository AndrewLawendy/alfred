import { useEffect, useSyncExternalStore } from "react";
import { useColorMode } from "@chakra-ui/react";

import {
  Appearance,
  onSystemChange,
  readAppearance,
  resolveAppearance,
  saveAppearance,
  setBrowserColour,
} from "utils/appearance";

// One choice shared by every screen that reads or changes it
let current = readAppearance();
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const setAppearance = (appearance: Appearance) => {
  saveAppearance(appearance);
  current = appearance;
  listeners.forEach((listener) => listener());
};

export const useAppearance = () =>
  useSyncExternalStore(subscribe, () => current);

// Keeps Chakra's light or dark in step with the choice, and with the phone
// while the choice is "system". Mounted once, inside ChakraProvider.
export const useApplyAppearance = () => {
  const appearance = useAppearance();
  const { setColorMode } = useColorMode();
  useEffect(() => {
    const apply = () => {
      const mode = resolveAppearance(appearance);
      setColorMode(mode);
      setBrowserColour(mode);
    };
    apply();
    return appearance === "system" ? onSystemChange(apply) : undefined;
  }, [appearance, setColorMode]);
};
