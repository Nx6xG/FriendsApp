# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Vite dev server (localhost:5173, exposes on network)
- `npm run build` — TypeScript check + Vite production build (output: `dist/`)
- `npm run lint` — ESLint (flat config, TS/TSX only)
- `npm run preview` — serve production build locally

### Capacitor (native)

```
npm run build && npx cap sync ios && npx cap open ios
npm run build && npx cap sync android && npx cap open android
```

## Architecture

**Mobile-first React SPA** for friend groups — managing todos, shared expenses, suggestions/voting, chat, events, places, and a map. Runs as a web app and wraps with Capacitor for iOS/Android. Currently **offline-only** using localStorage (no backend).

### Key patterns

- **State**: Single Zustand store (`src/stores/appStore.ts`) with `persist` middleware → localStorage. All app data (groups, todos, expenses, messages, notifications, profile) lives here. Contains hardcoded demo data for development.
- **Routing**: React Router v6 with nested routes. `GroupLayout` wraps all `/group/:groupId/*` routes, providing `GroupHeader` + `BottomNav` + `<Outlet>`. Group data is passed via `useOutletContext`.
- **Styling**: Tailwind CSS v4 via Vite plugin (no config file — uses CSS-based config in `index.css`). Dark theme with `#0a0c12` background. App is constrained to `max-w-[480px]` mobile viewport.
- **Path alias**: `@/` maps to `src/` (configured in vite.config.ts and tsconfig.app.json).
- **Language**: UI text is in **German**.

### Data model

All types are in `src/types/index.ts`. The central entity is `Group`, which contains arrays of `TodoItem`, `Expense`, `Suggestion`, `ChatMessage`, `FeedItem`, `GroupEvent`, `Place`, `MapPin`, and `LiveLocation`. Chat messages can have embedded content (`ChatEmbed`) for polls, expense requests, event invites, and todo assignments.

### Store actions

Store actions in `appStore.ts` follow a consistent pattern: accept `groupId` + entity, find the group, mutate the relevant array. Actions are organized by version (V1: todos/expenses/suggestions/chat, V2: events/places/roles, V3: map/live-location).
