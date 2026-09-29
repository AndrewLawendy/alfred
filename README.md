# Alfred

Your own wardrobe stylist. Photograph your shirts, belts, pants, shoes and
jackets, build outfits from them, and each morning Alfred lays out the next
outfit in your rotation and suggests a jacket when the weather calls for one.

Alfred is a mobile-first progressive web app: install it from the browser
("Add to Home Screen") and it runs full screen, works offline with the
outfits and photos you've already seen, and offers to reload when a new
version is out.

Live: https://alfred-wardrobe-stylist.web.app

## What it does

- **Today:** today's outfit with the weather. **Next outfit** moves on in the
  rotation; **Swap with next** wears the next one today and this one after it.
- **Jackets:** each jacket has the temperature it suits. When one or more
  suit the forecast, Alfred asks which to wear with the new outfit (or none),
  and remembers the pick for that outfit.
- **Outfits:** the rotation, in order. Drag to reorder; build or edit an
  outfit by picking one piece per category.
- **Wardrobe:** your clothes by category, each with a photo, a title and an
  optional description.
- **Morning reminder:** a notification at your time on your days (Account)
  nudging you to the next outfit, naming its pieces, with the weather and
  jacket call; on Android, **Wear it** moves the rotation on from there. On iPhone it needs
  Alfred installed to the Home Screen.
- **Shortcuts and sharing (Android):** long-press the icon for Next outfit,
  New outfit or Add to wardrobe, and share a photo from the gallery straight
  into Alfred.
- **Back** closes whatever is on top (a sheet, edit mode, an item or outfit)
  before leaving the page, like a native app. Items and outfits have their own
  links (`?item=<id>`, `?outfit=<id>`).

## Stack

- React 18 and TypeScript 6, built with Vite; the Workbox service worker
  (`src/service-worker.ts`) is built by vite-plugin-pwa
- Vitest and Testing Library; ESLint 9 and Prettier 3
- Chakra UI v2 (theme in `src/utils/theme.ts`) and framer-motion
- Firebase: Auth (Google, Facebook), Firestore, Storage, Hosting, Cloud
  Messaging, and a scheduled Cloud Function for the morning reminder
  (`functions/`)
- [OpenWeather](https://openweathermap.org/api) current weather
- wouter for routing

## Getting started

Requirements: Node 24 (`nvm use` picks it up from `.nvmrc`) and Yarn 1.

```sh
yarn install
```

Create a `.env` file in the project root with an OpenWeather API key:

```sh
VITE_WEATHER_API_ID=<your OpenWeather key>
```

Then:

```sh
yarn start   # opens http://localhost:3000
```

The service worker (offline, install, shortcuts, sharing, notifications) only
runs in a production build. To try those locally:

```sh
yarn build && yarn preview   # http://localhost:5055
```

The Cloud Function needs its own `functions/.env` (not committed) with the same
key:

```sh
WEATHER_API_ID=<your OpenWeather key>
```

The Firebase project config lives in `src/utils/firebase.ts`.

### Signing in during development

Sign-in uses a popup everywhere except on the Firebase auth domain
(`alfred-wardrobe-stylist.firebaseapp.com`), where it uses a redirect. Popups
work on `localhost` out of the box. Any other host (a tunnel, a LAN address)
must first be added under **Firebase console → Authentication → Settings →
Authorized domains**, or sign-in fails with `auth/unauthorized-domain`.

## Scripts

| Command           | What it does                                                   |
| ----------------- | -------------------------------------------------------------- |
| `yarn start`      | Vite dev server with hot reload; opens the browser             |
| `yarn build`      | Type-check, then a production build in `build/`                |
| `yarn preview`    | Serve that build on port 5055 (service worker included)        |
| `yarn test`       | Vitest in watch mode (`yarn test run` for a single run)        |
| `yarn test:rules` | Firestore and Storage rules against the emulators (needs Java) |
| `yarn lint`       | ESLint 9 with type-aware and React Compiler rules, with fixes  |
| `yarn format`     | Prettier over `src/`                                           |

The app version shown on the Account page comes from `version` in
`package.json`.

## Deploying

Build first, then preview on a Firebase Hosting channel before going live:

```sh
yarn build

# Preview at a temporary URL (printed at the end), valid for 7 days
npx firebase-tools hosting:channel:deploy dev --expires 7d

# Promote exactly what's on the preview to production
npx firebase-tools hosting:clone alfred-wardrobe-stylist:dev alfred-wardrobe-stylist:live
```

`yarn update` builds and deploys straight to production, skipping the
preview.

The morning reminder function has no preview channel; deploy it on its own:

```sh
cd functions && npm install && npm test && cd ..
npx firebase-tools deploy --only functions
```

Installed apps pick up a new version the next time they're opened and show
a **Reload** prompt. A bad release can be rolled back from **Firebase console
→ Hosting → Release history**.

## Project layout

```
src/
  pages/        Today (Home), Outfits, Wardrobe, Account, Login
  components/   Shared UI: page header, sheets, confirm, photo input, nav
  hooks/        useAuth, useForm, useBackToClose (Back closes the top layer)
  resources/    Firestore, Storage and weather hooks
  utils/        theme, history layers, rotation and jacket rules, types
functions/     The scheduled morning reminder (`reminder.js` holds its rules)
```

The rotation, jacket and reminder rules are plain functions with tests
(`src/utils/rotation.test.ts`, `src/utils/jacket.test.ts`,
`functions/reminder.test.js`).

## Contributing

- Commits follow [Conventional Commits](https://www.conventionalcommits.org);
  commitlint and lint-staged run on every commit through Husky.
- The weather is currently fixed to Cairo (`src/resources/useWeather.ts`).
