# Metro Memory
Modified fork of original Metro Memory game by Benjamin TD (https://github.com/benjamintd/metro-memory.com)

Metro Memory is an interactive, map-based memory challenge built with Next.js and Mapbox GL. This fork expands on Benjamin TD's original idea with additional metro systems, richer UI polish, multilingual support, and infrastructure for tracking how players perform across cities.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment variables](#environment-variables)
  - [Run the app](#run-the-app)
  - [Useful scripts](#useful-scripts)
- [Project Structure](#project-structure)
- [Game Data & Adding New Cities](#game-data--adding-new-cities)
- [Stats & Analytics](#stats--analytics)
- [Internationalization & Accessibility](#internationalization--accessibility)
- [Deployment Notes](#deployment-notes)
- [Contributing](#contributing)
- [License & Credits](#license--credits)

## Overview
Metro Memory invites players to type the names of metro, tram, and commuter rail stations from memory and watch them appear on an interactive map. Each city ships with curated line colors, icons, and metadata so the experience feels familiar to local riders.

This repository keeps the spirit of the original project while:
- Hosting more than twenty networks with their own layouts and metadata
- Bundling data pipelines that transform OpenStreetMap exports into GeoJSON consumed by the game
- Delivering a polished marketing site, stats dashboards, and dark mode support

## Features
- City search and landing experience that spotlights supported networks with preview imagery
- Mapbox GL based gameplay view with per-theme styles, label toggles, and route overlays
- Smart station lookup that handles alternate spellings, abbreviations, and accent-insensitive input
- Progress persistence in local storage, optional hinting, and celebratory confetti for high completion
- Per-line completion gauges and summaries that help players track coverage at a glance
- Stats pages that surface the most guessed stations using Vercel KV-backed counters with a cached fallback
- Internationalized UI strings (English, French, Spanish, Catalan) with easy hooks to add more languages

## Tech Stack
- Next.js 14 (App Router) with TypeScript
- React 18, Headless UI components, and Tailwind CSS styling
- Mapbox GL JS for map rendering
- Turf.js helpers for geospatial math and bounding boxes
- Fuse.js for fuzzy station matching
- @react-hookz/web for local storage state management
- Vercel KV or Upstash Redis for optional stats storage

## Getting Started

### Prerequisites
- Node.js 18 or later (Next.js 14 requires modern Node features)
- npm 9+ (bundled with recent Node releases)
- A Mapbox access token to render interactive maps

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

# optional gameplay controls
SOLUTIONS_PASSWORD=change-me
```

`SOLUTIONS_PASSWORD` lives exclusively on the server and powers the in-game "reveal all stations" password check. Never commit secret tokens to version control. On Vercel or another hosting provider, configure the same variables in the project settings.

### Run the app
```bash
npm run dev   # uses Turbopack by default (experimental)
```
By default the site is available at `http://localhost:3000`. The marketing homepage lives at `/`, and individual games at routes like `/ny`, `/london`, and `/tokyo`.

### Useful scripts
- `npm run build` &mdash; Compile a production build
- `npm run start` &mdash; Run the compiled build locally (after `npm run build`)
- `npm run lint` &mdash; Execute the Next.js ESLint checks

## Project Structure
```text
.
|-- src/
|   |-- app/
|   |   |-- (website)/        # Marketing pages, stats UI, shared layout providers
|   |   `-- (game)/           # Per-city game routes, configs, and data assets
|   |-- components/           # Shared UI pieces (GamePage, menus, inputs, modals)
|   |-- hooks/                # Custom hooks for map behavior, storage, analytics
|   |-- images/               # City thumbnails and icons
|   |-- lib/                  # Config context, i18n, type definitions, utilities
|   |-- scripts/              # Helpers for converting raw transit feeds into game data
|   `-- styles/               # Global Tailwind styles
|-- public/                   # Static assets (favicons, opengraph images, stats cache)
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

For a detailed walkthrough, check `src/app/(game)/potsdam/README.md`, which explains the full OpenStreetMap workflow and asset sourcing.

## Stats & Analytics
The game optionally records how often each station is found:
- `usePushEvent` batches station hits and posts them to `/api/count`, which increments counters in Vercel KV (or another REST-compatible KV store).
- `/api/stats/[slug]` reads aggregated counts, favoring live KV data and falling back to cached JSON files inside `public/stats/<slug>.json`.
- `CityStats` renders the heatmap-style overlays on `/stats/<slug>` by pairing the counts with each city's GeoJSON routes.

If you skip configuring KV credentials, the stats endpoints will rely entirely on the static cache, so you can still ship spoiler pages without a database.

## Internationalization & Accessibility
- UI copy lives in `src/lib/i18n.tsx`. English, French, Spanish, and Catalan translations ship out of the box; add more locales by extending the Rosetta dictionary.
- Station matching normalizes diacritics and script variants (Japanese, Korean) through helpers in `src/hooks/useNormalizeString.ts`, `src/lib/extractJapanese.ts`, and `src/lib/extractKorean.ts` so players are not penalized for typing variants.
- Alternate spellings and abbreviations reside alongside each city's data (`data/config.ts`), ensuring the fuzzy matcher recognizes local nicknames.
- The interface supports light and dark themes via `next-themes`, and includes keyboard focus styles for accessibility.

## Deployment Notes
- The project targets Next.js 14 with the App Router, so deployment to Vercel is plug-and-play. Other Node hosting providers work as long as they honor the required environment variables.
- Mapbox styles referenced in city configs must be accessible to your token. Use the provided fallbacks or supply your own custom styles.
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
