# FincaMap 🚜

A mobile app for farm management built with **Expo + React Native**. It lets you visualize your location on a map and manage crops stored in a local SQLite database.

> **Android only** — GPS and location features are currently implemented for Android. iOS support is incomplete (no location permission strings configured).

---

## What's inside

| Screen | Description |
|---|---|
| **Map** | Interactive MapLibre map with your real-time GPS location and a tractor marker |
| **Crops** | List of crops stored in local SQLite, seeded automatically on first launch |

The database schema also includes `fields`, `soil_types`, and `field_histories` tables — ready for future expansion.

---

## Prerequisites

Before you can run this project you need the following installed:

### Required (always)
- **Node.js** ≥ 18 — [nodejs.org](https://nodejs.org)
- **npm** ≥ 10
- **Expo CLI** — installed automatically via `npx`, no global install needed

### Required for Android (the primary target)
- **Android Studio** with:
  - Android SDK (API level 34 or higher)
  - An AVD (Android Virtual Device) emulator set up, **or** a physical Android device with USB debugging enabled
  - `ANDROID_HOME` environment variable pointing to your SDK folder

### Optional (macOS only, for iOS)
- **Xcode** 15+ with Command Line Tools
- **iOS Simulator** or a physical device with a provisioning profile

> ⚠️ **Expo Go will NOT work for this project.** The app uses `@maplibre/maplibre-react-native` which requires native code that cannot run inside the Expo Go sandbox. You must use the dev client workflow described below.

---

## Running locally

### 1. Install dependencies

```bash
npm install
```

### 2. Build and install the dev client on your device/emulator

This step compiles the native code and installs a custom Expo dev client on your device. You only need to do this once (or whenever you change native dependencies or `app.json`).

**Android:**
```bash
npm run build:android
# equivalent to: npx expo run:android
```

**iOS (macOS only):**
```bash
npm run build:ios
# equivalent to: npx expo run:ios
```

This will:
1. Generate the native `android/` (or `ios/`) project
2. Compile the native code
3. Install the app on your connected device or running emulator
4. Start the Metro bundler automatically

### 3. Start the bundler (subsequent runs)

Once the dev client is installed, for day-to-day JS-only development you can skip the native build and just start the bundler:

```bash
npm start
# equivalent to: npx expo start
```

Then open the **FincaMap** app on your device — it will connect to the Metro bundler automatically.

---

## Map tiles & API key

The map uses **MapTiler** for tile rendering. The API key is currently hardcoded in [`app/(tabs)/(map)/index.tsx`](app/%28tabs%29/%28map%29/index.tsx). 

To use your own key, replace the `mapStyle` URL in that file, or move it to an `.env` file using Expo's built-in env var support:

```bash
# .env.local
EXPO_PUBLIC_MAPTILER_KEY=your_key_here
```

```ts
// then in index.tsx:
mapStyle={`https://api.maptiler.com/maps/basic-v2/style.json?key=${process.env.EXPO_PUBLIC_MAPTILER_KEY}`}
```

---

## Backend Farm API Integration (farmOS)

This application is designed as the frontend (FE) for **[farmOS](https://github.com/farmOS/farmOS)**, an open-source farm management system. The goal is to allow farmers who already use farmOS to connect this app to their existing instance.

To configure the app to communicate with a farmOS backend:
1. Ensure you have a running instance of farmOS (e.g., hosted remotely or running locally).
2. The app will communicate with the farmOS REST/JSON API.
3. You will need to define the farmOS base URL in your local environment file:
   ```bash
   # .env.local
   EXPO_PUBLIC_API_URL=http://your-farmos-instance.com/api
   ```

*(Note: The integration is not yet implemented. In the future, you will need to add an API client—such as Axios or the `farmOS.js` library—to handle authentication and data synchronization between local SQLite and the farmOS server).*

---

## Tech stack

| Layer | Library | Version |
|---|---|---|
| Framework | Expo SDK | 57 |
| React Native | `react-native` | 0.86 |
| React | `react` | 19 |
| Routing | `expo-router` | 57 |
| Maps | `@maplibre/maplibre-react-native` | 11 |
| Map tiles | MapTiler API | — |
| Database | `expo-sqlite` | 57 |
| GPS | `@react-native-community/geolocation` | 3 |
| Language | TypeScript | 6 |

---

## Project structure

```
app/
├── _layout.tsx              # Root navigator (Stack)
├── (tabs)/
│   ├── _layout.tsx          # Tab navigator + SQLite provider
│   ├── (map)/
│   │   └── index.tsx        # Map screen
│   └── (crops)/
│       └── index.tsx        # Crops list screen
├── models/
│   └── entities/
│       ├── crop.ts          # Crop interface
│       └── seasonsEnum.ts   # Season enum
└── services/
    ├── db-service.ts        # SQLite schema migrations & seed data
    └── crop-services.ts     # Crop queries
```

---

## Available scripts

| Script | Description |
|---|---|
| `npm start` | Start the Metro bundler (requires dev client already installed) |
| `npm run build:android` | Build and run on Android device/emulator |
| `npm run build:ios` | Build and run on iOS simulator/device (macOS only) |
| `npm test` | Run tests with Jest |
| `npm run lint` | Run ESLint |
