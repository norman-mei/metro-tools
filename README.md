# Metro Memory 🚇
[Modified fork of original Metro Memory game by Benjamin TD](https://github.com/benjamintd/metro-memory.com)

Metro Memory is an interactive, map-based memory challenge built with Next.js and Mapbox GL. This fork expands on Benjamin TD's original idea with a far larger catalog of networks, achievements, account sync, richer UI polish, and deep personalization.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment variables](#environment-variables)
  - [Database setup (optional)](#database-setup-optional)
  - [Run the app](#run-the-app)
  - [Useful scripts](#useful-scripts)
- [Project Structure](#project-structure)
- [Game Data & Adding New Cities](#game-data--adding-new-cities)
- [Accounts & Sync](#accounts--sync)
- [Settings & Personalization](#settings--personalization)
- [Stats & Analytics](#stats--analytics)
- [Internationalization & Accessibility](#internationalization--accessibility)
- [Deployment Notes](#deployment-notes)
- [Contributing](#contributing)
- [License & Credits](#license--credits)

## Overview
Metro Memory invites players to type the names of metro, tram, and commuter rail stations from memory and watch them appear on an interactive map. Each city ships with curated line colors, icons, and metadata so the experience feels familiar to local riders.

This repository keeps the spirit of the original project while adding:
- 🌍 170+ city and regional networks across six continents
- 🧭 Multi-view discovery (globe, map, cover, list) with favorites, filters, and progress-aware sorting
- 🏅 Achievements, account-based progress sync, and deeper stats dashboards
- 🎛️ Personalization (themes, accent colors, keybindings, timezone-aware stats)
- 📰 Update log plus press/testimonial and support panels

## Features
- 🌍 170+ metro, tram, and commuter networks, grouped by continent and country
- 🔎 City discovery with search, filters, favorites, and multiple view modes (globe, map, cover, list)
- 🗺️ Mapbox GL gameplay with per-theme styles, route overlays, station label toggles, and optional satellite view
- 🧠 Smart station lookup that handles alternate spellings, abbreviations, and accent/script normalization
- 🏅 Achievements for every city plus a master badge, with celebratory toasts
- 📊 Progress insights: per-line completion, timelines, time spent, and fastest-line highlights
- 🧩 Accounts with email verification, progress sync across devices, and preference sync
- 🎛️ Settings panel for themes, accent colors, language, timezone, hour format, keybindings, and Zen Mode
- 🔐 Protected actions (solutions, satellite, map labels) gated by a server-side password
- 📈 Global + per-city stats using Vercel KV/Upstash with static cache fallback
- 📰 Update log, press/testimonial embeds, and built-in Ko-fi support

## Tech Stack
- 🧱 Next.js 16 (App Router), React 18, and TypeScript
- 🎨 Tailwind CSS, Headless UI, and next-themes
- 🗺️ Mapbox GL JS, Turf.js, and Fuse.js for geospatial search
- 🗃️ Prisma (SQLite by default) for accounts and progress sync
- ✉️ Nodemailer (Brevo SMTP) for verification emails
- 📊 Vercel Analytics + Speed Insights (optional), Vercel KV/Upstash for stats

## Getting Started

### Prerequisites
- ✅ Node.js 18 or later
- ✅ npm 9+
- ✅ A Mapbox access token to render interactive maps
- ✅ (Optional) A Prisma-compatible database if you want account sync

### Installation
```bash
git clone <repo-url>
cd metro-memory
npm install
```

### Environment variables
Create a `.env.local` file before running the app. Only the Mapbox token is strictly required; the remaining entries are optional enhancements.

```bash
# required for Mapbox GL
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your-mapbox-token-here

# optional map styles (falls back to Mapbox light/dark defaults)
NEXT_PUBLIC_MAPBOX_STYLE=mapbox://styles/your-account/light-style
NEXT_PUBLIC_MAPBOX_STYLE_DARK=mapbox://styles/your-account/dark-style

# optional analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# optional stats back ends (choose Vercel KV or Upstash)
KV_REST_API_URL=https://<region>.kv.vercel-storage.com
KV_REST_API_TOKEN=<vercel-kv-token>
KV_REST_API_READ_ONLY_TOKEN=<vercel-kv-readonly-token>
UPSTASH_REDIS_REST_URL=https://<upstash-endpoint>
UPSTASH_REDIS_REST_TOKEN=<upstash-token>

# optional accounts + sync (Prisma)
DATABASE_URL="file:./prisma/prisma/metro_memory.db"

# optional email verification (SMTP via Brevo)
BREVO_HOST=smtp-relay.brevo.com
BREVO_PORT=587
BREVO_USER=<brevo-user>
BREVO_PASS=<brevo-pass>
MAIL_FROM_NAME="Metro Memory"
MAIL_FROM_EMAIL=no-reply@your-domain.com
APP_BASE_URL=https://your-domain.com
NEXT_PUBLIC_BASE_URL=https://your-domain.com

# optional gameplay controls
SOLUTIONS_PASSWORD=change-me
```

`SOLUTIONS_PASSWORD` lives exclusively on the server and powers protected actions (solutions, satellite view, and map labels). Never commit secret tokens to version control. On Vercel or another hosting provider, configure the same variables in the project settings.

### Database setup (optional)
If you enable accounts and sync, run Prisma locally after setting `DATABASE_URL`:

```bash
npx prisma migrate dev --name init
# or: npx prisma db push
```

### Run the app
```bash
npm run dev   # uses Turbopack by default (experimental)
```
By default the site is available at `http://localhost:3000`. The marketing homepage lives at `/`, and individual games at routes like `/ny`, `/london`, and `/tokyo`.

### Useful scripts
- `npm run build` — Compile a production build
- `npm run start` — Run the compiled build locally (after `npm run build`)
- `npm run lint` — Execute the Next.js ESLint checks
- `npm run check:duplicate-keys` — Validate city config keys
- `npm run generate:station-totals` — Rebuild station totals for progress stats
- `npm run sync:icons` — Sync city icons for the homepage cards
- `npm run sync:icons:watch` — Watch and sync city icons on changes

## Project Structure
```text
.
|-- prisma/                 # Prisma schema and SQLite db
|-- scripts/                # Repo automation (icons, totals, translations)
|-- src/
|   |-- app/
|   |   |-- (website)/       # Marketing pages, stats UI, shared layout providers
|   |   `-- (game)/          # Per-city game routes, configs, and data assets
|   |-- components/          # Shared UI pieces (GamePage, menus, inputs, modals)
|   |-- context/             # Auth + settings providers
|   |-- hooks/               # Custom hooks for map behavior, storage, analytics
|   |-- images/              # City thumbnails and icons
|   |-- lib/                 # Config context, i18n, type definitions, utilities
|   |-- scripts/             # Helpers for converting raw transit feeds into game data
|   `-- styles/              # Global Tailwind styles
|-- public/                  # Static assets (favicons, opengraph images, stats cache)
|-- next.config.mjs
|-- package.json
`-- README.md
```

## Game Data & Adding New Cities
Each city lives under `src/app/(game)/<slug>` and includes:
- `page.tsx` that loads the feature collection and renders `GamePage`
- `config.ts` describing line colors, grouping, metadata, Mapbox bounds, and donation links
- `favicon.ico`, `opengraph-image.jpg`, and optional SVG assets for marketing visuals
- A `data/` directory with `features.json`, `routes.json`, and `lines.json` generated from transit feeds

The typical pipeline for introducing a new network is:
1. Export raw line and stop data from OpenStreetMap (relations, ways, nodes) into a `source.json` file. The Potsdam example documents one way to do this.
2. Copy `src/scripts/preprocess.ts` into the city's `data/` folder (or invoke it from there) and run it with `ts-node preprocess.ts`. It transforms the raw feed into the GeoJSON files that the game consumes.
3. Adjust `config.ts` to point to the city slug, tweak `MAP_CONFIG.bounds`, and wire up the generated `LINES` map and any `LINE_GROUPS` displayed in the sidebar.
4. Enrich `data/config.ts` (where present) with alternate station names so the fuzzy search recognizes local spelling variants.
5. Add the city to `src/lib/citiesConfig.ts` so it shows up on the home and stats pages. Provide an OpenGraph image for better link previews.
6. Run `npm run generate:station-totals` so progress percentages and stats stay accurate.
7. Run `npm run sync:icons` if you add new city imagery.

For a detailed walkthrough, check `src/app/(game)/europe/germany/potsdam/README.md`, which explains the full OpenStreetMap workflow and asset sourcing.

## Accounts & Sync
- 👤 Email/password accounts with verification
- ☁️ Sync found stations + timestamps across devices
- ⚙️ Sync preferences (language, timezone, view mode, collapsed sections)
- 🧹 Reset progress per city from the account panel

Account features require `DATABASE_URL` and SMTP credentials for verification emails. If you skip those, the game still works fully offline with localStorage-only progress.

## Settings & Personalization
- 🌗 Theme selection (light, dark, or system)
- 🎨 Accent color palettes
- 🌍 Language selector, timezone detection, and 12h/24h clock
- ⌨️ Custom keybindings and Zen Mode
- 🎉 Confetti, achievement toast, and completion controls

## Stats & Analytics
The game optionally records how often each station is found:
- `usePushEvent` batches station hits and posts them to `/api/count`, which increments counters in Vercel KV (or another REST-compatible KV store).
- `/api/stats/[slug]` reads aggregated counts, favoring live KV data and falling back to cached JSON files inside `public/stats/<slug>.json`.
- `CityStats` renders the heatmap-style overlays on `/stats/<slug>` by pairing the counts with each city's GeoJSON routes.
- The in-app City Stats panel surfaces timelines, line completion, and time-spent metrics from local or synced progress.

If you skip configuring KV credentials, the stats endpoints will rely entirely on the static cache, so you can still ship spoiler pages without a database.

## Internationalization & Accessibility
- UI copy lives in `src/lib/i18n.tsx`. Supported languages include English, French, Spanish, Catalan, German, Korean, Turkish, Japanese, Swedish, Hungarian, Simplified Chinese, Traditional Chinese, Vietnamese, Portuguese, Italian, Dutch, and Arabic.
- Station matching normalizes diacritics and script variants (Japanese, Korean, Chinese) through helpers in `src/hooks/useNormalizeString.ts`, `src/lib/extractJapanese.ts`, and `src/lib/extractKorean.ts` so players are not penalized for typing variants.
- Alternate spellings and abbreviations reside alongside each city's data (`data/config.ts`), ensuring the fuzzy matcher recognizes local nicknames.
- The interface supports light and dark themes via `next-themes`, and includes keyboard focus styles for accessibility.

## Deployment Notes
- The project targets Next.js 16 with the App Router, so deployment to Vercel is plug-and-play. Other Node hosting providers work as long as they honor the required environment variables.
- Mapbox styles referenced in city configs must be accessible to your token. Use the provided fallbacks or supply your own custom styles.
- If you enable accounts, configure `DATABASE_URL` and SMTP credentials plus `APP_BASE_URL` (or `NEXT_PUBLIC_BASE_URL`) so verification emails link back to your site.
- Static stat caches (`public/stats`) can be committed if you want spoiler pages without live data, but keep them updated when city data changes.

## Contributing
Pull requests are welcome. To keep reviews smooth:
- Run `npm run lint` and ensure the development server compiles without warnings.
- When adding a city, document the data source (OpenStreetMap relation IDs, official references) in a README within the city folder, mirroring the Potsdam example.
- Include new OpenGraph images and update `src/lib/citiesConfig.ts` so the homepage stays in sync.
- Avoid committing private tokens or personal analytics IDs.

## License & Credits
- Licensed under the MIT License. See `LICENSE.md` for details.
- Original concept and many assets by Benjamin Tran Dinh. This fork extends his work with additional cities, data tooling, and presentation layers.
- Map data courtesy of the OpenStreetMap community; please respect their usage guidelines when exporting or modifying datasets.
