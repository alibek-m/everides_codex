# Eve Rides

Eve Rides is a React Native + Fastify monorepo for a Miami-focused micromobility rental marketplace. This implementation follows the product plan in `eve-rides-plan.md` with two explicit changes from the current brief:

- Kill switch functionality is not implemented anywhere.
- Payments are intentionally mocked. The booking and host payout surfaces exist, but Stripe Connect is not wired.

## Workspace

```text
.
├── mobile/   Expo Router mobile app
├── server/   Fastify API + Prisma schema + Firebase token verification
├── shared/   Shared types, validation schemas, pricing rules, mock Miami inventory
└── eve-rides-plan.md
```

## What Is Real vs Mocked

### Real integration paths

- Firebase auth is wired into the mobile app and verified by the API when you provide credentials.
- Background trip tracking is implemented against `react-native-background-geolocation`.
- Push notification permission + local notification handling is implemented with Expo Notifications.
- Prisma schema is included for a real Postgres migration path.
- WebSocket-style live channels exist on the API for messages and location streams.

### Mocked on purpose

- Vehicle supply is seeded from realistic Miami mock inventory with remote image URLs.
- Payments use mock cards and mock payout responses.
- Identity verification currently moves through a manual review state instead of a live Persona session.
- The API uses an in-memory repository by default so the app is usable before real inventory and infra are online.

## Phase Coverage

### Implemented

- Phase 1 foundation: monorepo setup, shared models, Firebase-aware auth shell, navigation, profile APIs
- Phase 2 marketplace: search, filters, results, vehicle detail, favorites, host listing flow
- Phase 3 booking and payments: booking request flow, quote logic, payment method UI, mocked payment provider
- Phase 4 location tracking: consent gate, background tracking wrapper, location alerts, live trip map surfaces
- Phase 5 communication: inbox, notifications, chat thread UI, API endpoints, websocket rooms
- Phase 7 polish and launch prep: reviews, host earnings dashboard, identity review state, admin endpoints

### Explicitly not implemented

- Kill switch integration
- Kill switch admin controls
- Kill switch trigger rules
- Any kill-switch-related database fields or routes

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment files

```bash
cp mobile/.env.example mobile/.env
cp server/.env.example server/.env
```

Keep real secrets only in local ignored files such as `mobile/.env`, `server/.env`, or a local service-account JSON that is not committed. The repo is configured to ignore common Firebase secret files.

### 3. Firebase setup you need to do

#### Mobile app

Fill these values in `mobile/.env`:

- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`

#### API verification

Fill these values in `server/.env`:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

Recommended Firebase console actions:

1. Enable Email/Password auth.
2. Create a web app for the Expo client config.
3. Create a service account for the API and export the credentials.

### 4. Start the API

```bash
npm run dev:server
```

### 5. Start the mobile app

```bash
npm run dev:mobile
```

Because the app uses native modules for background location and maps, plan on using a development build instead of plain Expo Go:

```bash
cd mobile
npx expo prebuild
npx expo run:ios
# or
npx expo run:android
```

## Important Environment Flags

### Mobile

- `EXPO_PUBLIC_USE_REMOTE_API=false`
  Uses the seeded local marketplace and keeps the UI fully testable offline.
- `EXPO_PUBLIC_USE_REMOTE_API=true`
  Uses the Fastify API for profile, booking, favorites, notifications, and payments.

### Server

- `USE_MOCK_DATA=true`
  Keeps the API backed by in-memory data.
- `ENABLE_DEV_AUTH=true`
  Allows the API to impersonate the demo user when no Firebase token is present.

## Key Files

- `mobile/app/` contains the Expo Router screens.
- `mobile/src/providers/app-provider.tsx` holds the app state and local/remote switching logic.
- `mobile/src/services/location.ts` contains the background tracking wrapper.
- `server/src/repositories/mock-repository.ts` contains the default repository implementation.
- `server/prisma/schema.prisma` contains the production database shape.
- `shared/src/mock.ts` contains the seeded Miami marketplace data.

## Notes Before Launch

- Replace the in-memory repository with Prisma-backed repositories before production rollout.
- Replace Expo push token handling with your preferred production notification transport if you want to avoid Expo’s push relay.
- Add real privacy policy text before enabling live rentals.
- Review Florida and Miami-Dade operational requirements before launch.
