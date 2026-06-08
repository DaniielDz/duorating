# DuoRating - Agent Instructions

## Project

Mobile app (Android) for couples to rate movies/TV series together. Users link via invite code, share ratings and watchlist.

## Stack

- React Native + Expo + TypeScript
- NativeWind (Tailwind CSS for RN)
- Supabase (Auth + PostgreSQL)
- TMDB API (movie/series data)
- EAS Build → Play Store

## Commands

```bash
# Dev
npx expo start

# Build APK (testing)
eas build --platform android --profile preview

# Build AAB (production)
eas build --platform android --profile production
```

## Environment Variables

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_TMDB_API_KEY=
```

## Database

Three tables in Supabase: `couples`, `ratings`, `watchlist`. See `PLAN.md` for full schema.

## Conventions

- Commit format: `feat:`, `fix:`, `chore:`
- Components: PascalCase
- Files: kebab-case
- Expo Router file-based routing
