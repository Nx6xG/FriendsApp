# Friends 👥

**Die All-in-One App für Freundesgruppen.** Aufgaben verwalten, Kosten teilen, abstimmen, chatten und gemeinsame Erlebnisse planen — alles an einem Ort.

![React](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue) ![Capacitor](https://img.shields.io/badge/Capacitor-8-green) ![Supabase](https://img.shields.io/badge/Supabase-Backend-purple) ![Tailwind](https://img.shields.io/badge/Tailwind-4-cyan)

---

## Features

### 📋 Aufgaben
- Aufgaben erstellen, zuweisen (mehrere Personen), abhaken
- Prioritäten (Niedrig/Mittel/Hoch), Fälligkeitsdatum, Tags mit Farben
- Beschreibung, Kommentare, Verknüpfungen zu Events/Orten/Kosten
- Swipe-to-Complete mit Haptic Feedback

### 💰 Kosten teilen
- Ausgaben erfassen mit gleichmäßigem oder individuellem Split
- Kategorien (Essen, Transport, Freizeit, etc.)
- Wiederkehrende Ausgaben (wöchentlich/monatlich)
- Schuldenübersicht mit "Als bezahlt markieren"
- Zahlungshistorie

### 💬 Chat
- Gruppenchat mit Echtzeit-Synchronisation
- Eingebettete Umfragen, Event-Einladungen, Aufgabenzuweisungen
- Verknüpfungen zu allen App-Inhalten teilen
- Emoji-Reactions auf Nachrichten

### 💡 Ideen & Bucket List
- **Voting-Modus**: Vorschläge machen und abstimmen
- **Bucket List**: Gemeinsame Wunschliste zum Abhaken
- Verknüpfungen zu Events und Orten

### 📅 Events
- Events erstellen mit RSVP
- Kalenderansicht (Monatsübersicht)
- Wiederkehrende Events
- Export in den iOS/Google Kalender (.ics)
- Verknüpfungen zu Orten und Aufgaben

### 📍 Orte & Bewertungen
- Orte hinzufügen und bewerten (halbe Sterne)
- Bewertung nachträglich ändern
- Sortierung: Neueste, Beste, Schlechteste, A-Z
- Kategorien: Restaurant, Café, Bar, Aktivität, etc.

### 🗺️ Weltkarte
- Interaktive Leaflet-Karte mit Dark-Mode Tiles
- Pins für besuchte Orte (grün) und Wunschliste (amber)
- Auf Karte tippen um neuen Pin zu setzen
- GPS Live-Standort teilen (pro Gruppe)
- Fly-to-Animation beim Antippen von Pins/Personen

### 📊 Stats
- Gesamtausgaben, Top-Spender, Aufgaben-Statistiken
- Chat-Aktivität pro Mitglied
- Top-bewertete Orte

### 👥 Gruppen
- Gruppen erstellen mit Emoji und Mitgliedern
- Einladungscodes zum Beitreten (teilbar via iOS Share Sheet)
- Rollen: Admin, Mitglied, Zuschauer
- Personalisierbare Navigation (4 Tabs frei wählbar)
- Wählbarer Start-Tab pro Gruppe

### 🔗 Verknüpfungen
- Alles mit allem verknüpfen: Aufgaben ↔ Events ↔ Orte ↔ Kosten ↔ Karten-Pins
- Suchfunktion im Verknüpfungs-Picker
- Farbcodierte Chips-Anzeige

### 🔍 Globale Suche
- Durchsucht alle Gruppen: Aufgaben, Kosten, Events, Orte, Chat, Ideen, Karten-Pins
- Ergebnisse nach Typ gruppiert
- Direkte Navigation zum Ergebnis

### ⚙️ Weitere Features
- 🌙 Dark Mode & Light Mode
- 🌐 Deutsch & Englisch
- 🔔 Lokale Push Notifications (Event-Erinnerungen, Aufgaben-Zuweisung)
- 📳 Haptic Feedback
- 🎨 Splash Screen
- 💬 Support & Feedback (direkt in der App)
- 🎮 Interaktives Onboarding mit Live-Demos
- 🔒 Demo-Modus zum Ausprobieren ohne Account

---

## Tech Stack

| Technologie | Verwendung |
|---|---|
| **React 19** | Frontend Framework |
| **TypeScript** | Type Safety |
| **Tailwind CSS v4** | Styling |
| **Zustand** | State Management (mit localStorage Persistenz) |
| **Supabase** | Auth, PostgreSQL Database, Realtime Sync |
| **Capacitor 8** | Native iOS/Android Wrapper |
| **Leaflet** | Interaktive Weltkarte |
| **Framer Motion** | Animationen |
| **Vite 8** | Build Tool |
| **Lucide React** | Icons |

---

## Erste Schritte

### Voraussetzungen
- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/friends-app.git
cd friends-app
npm install
```

### Entwicklung

```bash
npm run dev
```

Öffne `http://localhost:5173` im Browser.

### Build

```bash
npm run build
npm run preview
```

### iOS (Capacitor)

```bash
npm run build
npx cap sync ios
npx cap open ios
```

Dann in Xcode: iPhone auswählen → ▶️ Play.

---

## Supabase Setup

Die App nutzt Supabase als Backend. Um deine eigene Instanz einzurichten:

1. Erstelle ein Projekt auf [supabase.com](https://supabase.com)
2. Führe `supabase-schema.sql` im SQL Editor aus
3. Kopiere deine **Project URL** und **anon key** in `src/lib/supabase.ts`
4. Aktiviere Realtime für die relevanten Tabellen (ist im Schema enthalten)

---

## Projektstruktur

```
src/
├── components/
│   ├── ui/           # Avatar, LinkedChips, LinkPicker, DemoBanner
│   ├── layout/       # GroupLayout, GroupHeader, BottomNav
│   └── groups/       # NewGroupSheet
├── pages/            # Alle Seiten (Home, Todos, Chat, Events, etc.)
├── stores/
│   └── appStore.ts   # Zustand Store mit Supabase Write-Through
├── lib/
│   ├── supabase.ts   # Supabase Client
│   ├── supabaseData.ts # Datenbank CRUD Operationen
│   ├── sync.ts       # Realtime Sync & Initial Fetch
│   ├── i18n.ts       # Übersetzungen (DE/EN)
│   ├── location.ts   # GPS Tracking
│   ├── notifications.ts # Push Notifications
│   ├── haptics.ts    # Haptic Feedback
│   ├── search.ts     # Globale Suche
│   ├── tabs.ts       # Tab-Definitionen
│   └── utils.ts      # Helper Functions
├── types/
│   └── index.ts      # TypeScript Interfaces
├── App.tsx           # Root mit Auth, Theme, Splash
└── main.tsx          # Entry Point
```

---

## Lizenz

MIT

---

**Made with ❤️ in Vienna**
