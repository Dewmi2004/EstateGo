# EstateGo — Mobile App (Day 1 + Day 2)

Project setup, navigation, theming, and mock JWT authentication for the
EstateGo React Native (Expo) app. Built to match the coursework brief:
React Native Expo, TypeScript, Redux Toolkit, React Navigation, Axios, MSW,
AsyncStorage, React Native Paper.

## What's included

- **Project setup**: Expo + TypeScript, path alias `@/*` → `src/*`, theme, folder structure
- **Navigation**: `RootNavigator` switches Splash / Auth / Main based on Redux state
  (this *is* the protected-route logic — no manual redirects needed)
- **Auth UI**: Login and Register screens, responsive (phone + tablet), validated forms
- **Mock JWT auth via MSW**: `POST /login`, `POST /register`, `POST /logout`
  handled by `msw/native`, backed by an in-memory mock user DB
- **Redux `authSlice`**: `loginUser`, `registerUser`, `logoutUser`, `bootstrapAuth` thunks
- **Token persistence**: AsyncStorage stores token + expiry + user; restored on app launch
  and cleared automatically if the token has expired
- **Reusable components**: `Button`, `Input`, `Loader` (React Native Paper based)
- **Responsive helpers**: `src/utils/responsive.ts` (`wp`, `hp`, `moderateScale`,
  `isTablet`, `maxContentWidth`) — screens clamp their max width on tablets/web

## Demo login

```
Email: demo@estategoNumbergo.com
Password: password123
```

Or just tap **Register** and create a new account — it's added to the in-memory
mock DB immediately and logs you straight in.

## Setup

```bash
npm install
npx expo start
```

Requires Node 18+. Use `npx expo start --android`, `--ios`, or `--web` for a
specific target.

## Folder structure

```
src/
├── components/       Button, Input, Loader
├── hooks/             typed useAppDispatch / useAppSelector
├── navigation/        RootNavigator, AuthNavigator, MainNavigator
├── redux/
│   ├── auth/authSlice.ts
│   └── store.ts
├── screens/
│   ├── auth/          Splash, Login, Register
│   ├── home/           Home (placeholder for property CRUD)
│   └── profile/        Profile + logout
├── services/
│   ├── api/            axios instance + authApi
│   └── msw/             handlers, mock DB, mock JWT, server bootstrap
├── theme/               colors + react-native-paper theme
└── utils/                responsive scaling helpers
```

## How the mock JWT works

`src/services/msw/mockJwt.ts` builds a token shaped like a real JWT
(`header.payload.signature`, base64url encoded) with an `exp` claim 24 hours
out. It isn't cryptographically signed — it's a drop-in placeholder so the
rest of the app (storage, expiry checks, `Authorization: Bearer <token>`
header) behaves exactly as it would against a real backend. Swapping MSW for
a real API later only touches `axiosInstance.ts`'s `BASE_URL` and removing
the `startMockServer()` call in `App.tsx`.

## Next (Day 3+)

Property CRUD, search/filters, favorites, AI chatbot — per the coursework plan.
