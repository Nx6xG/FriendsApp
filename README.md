# Friends App 👥

Eine App für Freundesgruppen — Aufgaben, Kosten teilen, Abstimmungen & Chat.

## Tech Stack

- **Frontend:** React 19 + TypeScript + Tailwind CSS v4
- **State:** Zustand (mit localStorage Persistenz)
- **Routing:** React Router v6
- **Animations:** Framer Motion
- **Native:** Capacitor (iOS + Android)
- **Build:** Vite

## Projektstruktur

```
src/
├── components/
│   ├── ui/           # Avatar, Button, etc.
│   ├── layout/       # GroupLayout, GroupHeader, BottomNav
│   └── groups/       # NewGroupSheet
├── pages/
│   ├── OnboardingPage.tsx
│   ├── HomePage.tsx
│   ├── FeedPage.tsx
│   ├── TodosPage.tsx
│   ├── ExpensesPage.tsx
│   ├── IdeasPage.tsx
│   └── ChatPage.tsx
├── stores/
│   └── appStore.ts   # Zustand Store
├── types/
│   └── index.ts      # TypeScript Interfaces
├── lib/
│   └── utils.ts      # Helper Functions
├── App.tsx
├── main.tsx
└── index.css
```

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Native Apps (Capacitor)

### iOS

```bash
npm run build
npx cap add ios          # Einmalig
npx cap sync ios
npx cap open ios         # Öffnet Xcode
```

Dann in Xcode: Signing konfigurieren → Build → Archive → App Store Connect

### Android

```bash
npm run build
npx cap add android      # Einmalig
npx cap sync android
npx cap open android     # Öffnet Android Studio
```

Dann in Android Studio: Generate Signed Bundle → Play Console hochladen

## Features (MVP / V1)

- [x] Onboarding Tutorial
- [x] Gruppen erstellen mit Emoji & Mitgliedern
- [x] Feed / Timeline
- [x] ToDo-Liste mit Zuweisung
- [x] Kosten Split + Schulden-Übersicht
- [x] Vorschläge + Voting
- [x] Gruppen-Chat

## Roadmap

### V2
- [ ] Event Kalender
- [ ] Orte + Bewertungen
- [ ] Stats (wer zahlt am meisten, etc.)
- [ ] Rollen (Admin, Member, Viewer)

### V3
- [ ] Weltkarte (wo waren wir, wo wollen wir hin)
- [ ] Live Location (optional)
- [ ] KI Features (Rechnungen scannen)
- [ ] Push Notifications

## Backend (nächster Schritt)

Aktuell läuft alles lokal mit localStorage. Für Multi-User Support:
- **Supabase** (Auth + Realtime DB + Row Level Security)
- Oder eigenes Backend mit FastAPI + PostgreSQL
