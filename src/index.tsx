import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import "./utils/pwa";
import { dropClosedLayers, putPageUnderLink } from "./utils/history";

putPageUnderLink();
dropClosedLayers();

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register({
  // UpdatePrompt (inside ChakraProvider) listens for this and offers a reload
  onUpdate: (registration) =>
    window.dispatchEvent(
      new CustomEvent("sw-update", { detail: registration })
    ),
});

// Ask the browser not to clear cached photos and outfits when storage runs
// low; installed apps are usually granted this
navigator.storage?.persist?.().catch(() => undefined);
