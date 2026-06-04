@AGENTS.md

# Unstuck 21 — Project Handover

React Native + Expo SDK 54 app for Coach Erik Javier's "Unstuck 21" 21-day habit program.
Developer: Marvin Fernandez (marvin@zerocompany.com)

---

## Stack

| Layer | Tech |
|---|---|
| Mobile | Expo SDK 54, React Native 0.81, Expo Router (file-based) |
| State | Zustand (4 stores) |
| Animations | React Native Reanimated 3 + Moti |
| Video | expo-av (Video component) — Expo Go compatible |
| Audio | expo-av (Audio.Sound) for ambient background music |
| Storage | expo-secure-store (journals/tokens), AsyncStorage (progress/flags) |
| Auth | Custom JWT — 15min access tokens, 30-day rotating refresh tokens |
| Backend | Express + Drizzle ORM + PostgreSQL on Railway |
| Payments | react-native-iap v13 (stubbed in Expo Go, real in EAS builds) |
| Fonts | DM Serif Display, DM Sans, IBM Plex Mono via @expo-google-fonts |

---

## Key Paths

```
app/
  _layout.tsx          — Root: fonts, AuthGuard routing, AmbientPlayer overlay
  (auth)/              — login, register, welcome, diagnosis, goal, accountability, commitment
  (app)/
    _layout.tsx        — Bottom tab bar
    index.tsx          — Dashboard
    journey.tsx        — 21-day journey list
    day/[id].tsx       — Day workspace (video, checklist, journal, confetti modal)
    profile.tsx
    tools/             — pomodoro, breathing, havening, release, batching

components/
  ui/                  — Button, Card, AmbientPlayer, UpsellModal, ProgressDots
  journey/             — VideoPlayer (expo-av), ChecklistItem
  dashboard/           — AttentionStealers

store/
  useAuthStore.ts      — user session, login/register/logout
  useUserStore.ts      — onboarding data (stuck_pattern, goal, etc.)
  useJourneyStore.ts   — day progress, journals (SecureStore), hard stop
  useToolStore.ts      — zen mode, victory log, attention stealers

lib/
  api.ts               — fetch wrapper, auto-refresh on 401, all API calls
  iap.ts               — react-native-iap wrapper (lazy-loaded, no-op in Expo Go)

constants/
  curriculum.ts        — All 21 days content (title, science, routine[], spot[], videoUrl?)
  colors.ts / typography.ts / spacing.ts

backend/src/
  index.ts             — Express app
  routes/auth.ts       — register, login, refresh, logout, me, onboarding
  routes/progress.ts   — GET/PATCH day progress
  routes/iap.ts        — Apple/Google receipt verification
  routes/admin.ts      — admin panel routes (x-admin-secret header)
  db/schema.ts         — users, cohorts, progress, refreshTokens tables
  db/index.ts          — Drizzle + pg Pool (SSL disabled — Railway internal DB has no SSL)
```

---

## Environment Variables

### Frontend (.env)
```
EXPO_PUBLIC_API_URL=https://backend-production-f2b1.up.railway.app
EXPO_PUBLIC_AMBIENT_URL=       # set when audio file uploaded to R2
```

### Backend (backend/.env + set on Railway)
```
DATABASE_URL=postgresql://unstuck21:MRrheSt4RrMRgSfbUULh6ilw@postgres.railway.internal:5432/unstuck21
DATABASE_PUBLIC_URL=postgresql://unstuck21:MRrheSt4RrMRgSfbUULh6ilw@acela.proxy.rlwy.net:28474/unstuck21
JWT_SECRET=if408CmxWUnVdiuy8C2XTWPFsRovnNSForFxogU3N9TiMio7zokWjIvCgGHKF
JWT_REFRESH_SECRET=cTf1ldzsvcPIjRK0C2AEA5faxeeLVEBD6g8OolfsdyJp7DDj3uDyoXKkRQpc5q
ADMIN_SECRET=CcCQOLkxAUDbQjCdtjdjeISdQVzyl22u
NODE_ENV=production
PORT=3000
```

---

## Railway Deployment

- **Backend URL**: https://backend-production-f2b1.up.railway.app
- **Project ID**: edee5e12-0a98-4e27-8c30-52d4dee7c037
- **Backend service ID**: 017abb1c-302e-448d-884f-a6c6c51d2d3a
- **Postgres service ID**: 6672d7fc-dac1-4566-b8ff-08360d3549c9
- **Environment ID**: 670b66d2-d253-4d23-9f27-13f84348a0ef
- **Railway token**: cceb0ebe-7ebc-44d5-a016-d5e6d7716e4f

Deploy backend changes:
```bash
cd backend && railway up --service backend
```

Run DB migrations (uses public TCP proxy, not internal URL):
```bash
cd backend && npx drizzle-kit push
# drizzle.config.ts reads DATABASE_PUBLIC_URL first
```

---

## Expo Go Testing

The app runs in **Expo Go (SDK 54)**. Two packages are handled specially:

- **expo-video** → replaced with `expo-av` Video component (Expo Go compatible)
- **react-native-iap** → redirected to `mocks/react-native-iap.js` (no-op stub) via `metro.config.js`
  when not an EAS build. NitroModules hard-crash Expo Go.

Start dev server:
```bash
npx expo start
```

---

## EAS Build (for production / IAP testing)

```bash
eas build --platform ios --profile preview
```

`eas.json` is configured. Bundle ID: `com.zerocompany.unstuck21`
Apple ID for submission: `marvin@zerocompany.com`
EAS Project ID: `e8eac4df-02ea-498e-a645-2d205d844d2c`

When doing an EAS build, `EAS_BUILD` env var is set — Metro uses the real `react-native-iap`.

---

## IAP Product IDs (must be created in App Store Connect + Google Play)

```
unstuck21_basic   — ₱1,499 DIY
unstuck21_cohort  — ₱7,499 Live Cohort
unstuck21_vip     — ₱13,999 VIP Breakthrough
unstuck21_alumni  — ₱749 alumni re-entry
```

---

## Pending Features (not yet built)

- [ ] **Tab bar icons** — currently text labels, spec requires Lucide icons
- [ ] **Upsell prompts** — after Day 1 (basic), Day 3 (cohort), Day 7 (vip) based on accountability_style
- [ ] **Push notifications** — day reminders, completion celebrations
- [ ] **VIP/Cohort features** — VIP badge, Book B PDF download, Zoom links, FB group
- [ ] **Admin web panel** — separate React + shadcn/ui project for Coach Erik
- [ ] **APPLE_SHARED_SECRET** env var — set on Railway for IAP receipt verification
- [ ] **Video URLs** — add R2/HTTPS URLs to `constants/curriculum.ts` per day when uploaded
- [ ] **Ambient audio URL** — set `EXPO_PUBLIC_AMBIENT_URL` when audio file uploaded to R2

---

## Known Gotchas

- `backend/src/db/index.ts` — SSL is **off**. Railway internal Postgres does not support SSL.
  Set `DATABASE_SSL=true` env var only if connecting to an external DB that requires it.
- `metro.config.js` — stubs `react-native-iap` for Expo Go via `extraNodeModules`.
- `expo-av` `Video` component used instead of `expo-video` for Expo Go compatibility.
- Journal entries in `expo-secure-store`, one key per day (`journal_day_N`). ~2KB limit per key;
  long journals silently fall back to AsyncStorage.
- `useJourneyStore` loads journals lazily inside `initDay` — they are NOT in the AsyncStorage
  progress blob (stripped out intentionally before save).
