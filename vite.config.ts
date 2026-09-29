import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vitest/config";

const { version } = JSON.parse(readFileSync("package.json", "utf8"));
const src = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    // Our own service worker (src/service-worker.ts): offline, photo cache,
    // share target and notification taps. Workbox only adds the precache list.
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "service-worker.ts",
      // serviceWorkerRegistration.ts registers it; public/manifest.json stays
      injectRegister: false,
      manifest: false,
      injectManifest: {
        // The app's own files; icons and splash screens load when needed
        globPatterns: ["index.html", "assets/**/*.{js,css,svg,png,woff2}"],
      },
    }),
  ],
  resolve: {
    // "components/…", "utils/…": the folders in src import by name
    alias: [
      {
        find: /^(assets|components|hooks|pages|resources|utils)\//,
        replacement: `${src}/$1/`,
      },
    ],
  },
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  server: { port: 3000, open: true },
  build: { outDir: "build" },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "src/setupTests.ts",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
