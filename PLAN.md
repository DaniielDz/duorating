# DuoRating - Technical Plan

## 1. Overview

**DuoRating** is a mobile application (Android) that allows couples to rate movies and TV series together, maintain a shared watchlist, and track their viewing history. The UI is designed to be clean, modern, and intuitive following Material Design principles.

---

## 2. Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React Native + Expo + TypeScript |
| Styling | NativeWind (Tailwind CSS for RN) |
| Backend | Supabase (Auth + PostgreSQL) |
| External API | TMDB (The Movie Database) |
| Build & Deploy | EAS Build → Google Play Store |

---

## 3. Database Schema (Supabase / PostgreSQL)

### Table: `couples`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique couple ID |
| user_1_id | uuid (FK) | First user (auth.users) |
| user_2_id | uuid (FK) | Second user (auth.users) |
| invite_code | text | Code to link a partner |
| created_at | timestamptz | Creation date |

### Table: `ratings`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Rating ID |
| couple_id | uuid (FK) | References couples |
| tmdb_id | integer | TMDB movie/series ID |
| media_type | text | "movie" or "tv" |
| title | text | Title from TMDB |
| poster_path | text | Poster image path |
| user_1_score | integer (1-10) | First user's score |
| user_2_score | integer (1-10) | Second user's score |
| user_1_comment | text | First user's comment |
| user_2_comment | text | Second user's comment |
| created_at | timestamptz | Creation date |

### Table: `watchlist`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Entry ID |
| couple_id | uuid (FK) | References couples |
| tmdb_id | integer | TMDB movie/series ID |
| media_type | text | "movie" or "tv" |
| title | text | Title from TMDB |
| poster_path | text | Poster image path |
| added_by | uuid (FK) | Who added it |
| created_at | timestamptz | Creation date |

---

## 4. Features

### 4.1 Authentication
- Email/password registration and login via Supabase Auth.
- Each user has their own account.
- Persistent sessions with secure storage.

### 4.2 Couple Linking
- After registration, a user generates an **invite code**.
- The partner enters the code to link accounts.
- Both share the same `couple_id` for ratings and watchlist.

### 4.3 Content Search (TMDB)
- Search bar with real-time results.
- Display poster, title, year, and media type (movie/TV).
- Option to add to watchlist or rate directly.

### 4.4 Ratings
- Dual scoring system: each user rates independently (1-10).
- Optional text comments per user.
- Average score displayed.
- Filter by: All / Movies / TV Shows / Highest Rated.

### 4.5 Watchlist (Pending)
- Add content from search results.
- Mark as watched (moves to ratings).
- Remove from list.

### 4.6 History
- Chronological list of rated content.
- Sorting and filtering options.

---

## 5. Project Structure

```
duorating/
├── PLAN.md
├── app.json
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── babel.config.js
├── .env.example
├── assets/
│   ├── icon.png
│   ├── splash.png
│   └── adaptive-icon.png
├── src/
│   ├── app/
│   │   ├── _layout.tsx          # Root layout (navigation)
│   │   ├── (auth)/
│   │   │   ├── login.tsx
│   │   │   └── register.tsx
│   │   ├── (main)/
│   │   │   ├── _layout.tsx      # Tab navigation
│   │   │   ├── index.tsx        # Dashboard/Home
│   │   │   ├── search.tsx       # TMDB search
│   │   │   ├── watchlist.tsx    # Pending list
│   │   │   └── history.tsx      # Rating history
│   │   └── couple/
│   │       ├── link.tsx         # Link with partner
│   │       └── settings.tsx     # Couple settings
│   ├── components/
│   │   ├── ui/                  # Reusable UI components
│   │   ├── auth/                # Login, Register forms
│   │   ├── search/              # Search bar & results
│   │   ├── ratings/             # Rating cards, score inputs
│   │   └── watchlist/           # Watchlist items
│   ├── lib/
│   │   ├── supabase.ts          # Supabase client setup
│   │   └── tmdb.ts              # TMDB API helpers
│   ├── hooks/                   # Custom React hooks
│   ├── types/                   # TypeScript interfaces
│   └── utils/                   # Helper functions
└── eas.json                     # EAS Build config
```

---

## 6. Environment Variables

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_TMDB_API_KEY=your_tmdb_api_key
```

---

## 7. Development Phases

### Phase 1 - Setup & Configuration
- [ ] Scaffold Expo project with TypeScript template
- [ ] Configure NativeWind (Tailwind CSS for RN)
- [ ] Set up Supabase project and create tables
- [ ] Configure `.env` variables
- [ ] Set up Expo Router for navigation

### Phase 2 - Authentication
- [ ] Login screen
- [ ] Register screen
- [ ] Protected routes with auth context
- [ ] Couple linking via invite code

### Phase 3 - Content Discovery
- [ ] TMDB integration (search + details)
- [ ] Search screen with results grid
- [ ] Movie/TV detail modal

### Phase 4 - Core Features
- [ ] Rating system (dual scores + comments)
- [ ] Watchlist management
- [ ] Dashboard with stats
- [ ] Rating history with filters

### Phase 5 - Polish & Build
- [ ] Loading states & error handling
- [ ] App icon and splash screen
- [ ] EAS Build setup
- [ ] Generate APK for testing
- [ ] Generate AAB for Play Store

---

## 8. Build & Deploy

### Testing (APK)
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build APK for testing
eas build --platform android --profile preview
```

### Production (Play Store)
```bash
# Build AAB for Play Store
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

### Build Profiles (eas.json)
```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

---

## 9. Rules & Conventions

- Commit messages in English, conventional format: `feat:`, `fix:`, `chore:`.
- Component naming in PascalCase.
- File naming in kebab-case.
- All TypeScript strict mode enabled.
- No secrets committed to repository.
- Use Expo Router file-based routing.
