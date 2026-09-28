import { useSyncExternalStore } from "react";

// The browser's install prompt (Android, desktop Chrome and Edge). It fires
// once, often before React mounts, so it's caught here at load and kept.
type InstallPromptEvent = Event & { prompt: () => Promise<void> };
let installPrompt: InstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPrompt = event as InstallPromptEvent;
  notify();
});
window.addEventListener("appinstalled", () => {
  installPrompt = null;
  notify();
});

export const isInstalled = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

// iPhone and iPad have no install prompt: installing is Share → Add to Home
// Screen. iPadOS reports itself as a Mac, so check for touch too.
export const isIOS = () =>
  /iPhone|iPad|iPod/.test(navigator.userAgent) ||
  (navigator.userAgent.includes("Mac") && navigator.maxTouchPoints > 1);

const subscribe = (onChange: () => void) => {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
};

// null until the browser offers installing
export const useInstallPrompt = () =>
  useSyncExternalStore(subscribe, () => installPrompt);

export const install = async () => {
  if (!installPrompt) return;
  await installPrompt.prompt();
  installPrompt = null;
  notify();
};

const subscribeOnline = (onChange: () => void) => {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
};

export const useOnline = () =>
  useSyncExternalStore(subscribeOnline, () => navigator.onLine);
