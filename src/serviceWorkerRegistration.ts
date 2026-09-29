// Registers the service worker (src/service-worker.ts) in production builds
// and reports a new version once it's ready, for the update prompt.

type Config = {
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
};

function watchForUpdates(
  registration: ServiceWorkerRegistration,
  config?: Config
) {
  // A version downloaded earlier may already be waiting
  if (registration.waiting && navigator.serviceWorker.controller) {
    config?.onUpdate?.(registration);
  }
  registration.onupdatefound = () => {
    const installingWorker = registration.installing;
    if (!installingWorker) return;
    installingWorker.onstatechange = () => {
      // Installed while an older version still controls the page: an update.
      // Without a controller it's the first install, and nothing to announce.
      if (
        installingWorker.state === "installed" &&
        navigator.serviceWorker.controller
      ) {
        config?.onUpdate?.(registration);
      }
    };
  };
}

export function register(config?: Config) {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;

  // Installed apps resume from the background instead of reloading, so check
  // for a new version whenever the app comes back into view. Looked up each
  // time, so it still works if registering failed (e.g. the app opened offline).
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    navigator.serviceWorker
      .getRegistration()
      .then((registration) => {
        if (!registration) return;
        watchForUpdates(registration, config);
        return registration.update();
      })
      .catch(() => undefined);
  });

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}service-worker.js`)
      .then((registration) => watchForUpdates(registration, config))
      // Offline or blocked: the app still works, just without offline support
      .catch(() => undefined);
  });
}
