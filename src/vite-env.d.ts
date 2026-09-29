/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WEATHER_API_ID: string;
}

// package.json's version, set at build time (vite.config.ts)
declare const __APP_VERSION__: string;
