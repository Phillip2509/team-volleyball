# Team Volleyball

Team Volleyball ist eine neue Expo-/React-Native-/TypeScript-Basis fuer eine moderne Volleyball-Mannschafts-App. Die App ist als eigenstaendiges Projekt angelegt und nutzt bestehende Projekte nur als technische Referenz.

## Aktueller Basisstand

- Expo SDK 56 mit Expo Router und TypeScript
- Tabs fuer Start, Termine, Team, Nachrichten und Einstellungen
- Light Mode, Dark Mode und Systemmodus
- Lokale Demo-Daten fuer UI-Entwicklung
- Supabase-Client vorbereitet, aber ohne echte Zugangsdaten
- Auth-Struktur mit Login/Registrierung und lokalem Demo-Modus
- Keine HealthKit-, Kalender-, Push- oder EAS-Verknuepfung

## Technologien

- Expo
- React Native
- TypeScript
- Expo Router
- Supabase JS Client
- AsyncStorage fuer lokale Einstellungen
- ESLint

## Lokale Installation

```bash
npm install
```

## .env einrichten

Kopiere `.env.example` lokal nach `.env` und trage spaeter echte Supabase-Werte ein:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Ohne `.env` startet die App mit einer Setup-Seite. Von dort kann die lokale Demo-App geoeffnet werden.

## Startbefehle

```bash
npm run web
npm run android
npm run ios
```

## Geplante Funktionen

- echte Team- und Mitgliederverwaltung
- Termine mit Zu- und Absagen
- Nachrichten fuer Mannschaftsinformationen
- Rollen fuer Spieler, Trainer und Admins
- Supabase-Persistenz und RLS-Migrationen
- spaetere native Builds per EAS

## Demo-Daten

Alle aktuell angezeigten Personen, Termine und Nachrichten sind lokale Mock-Daten aus `data/demo-data.ts`. Sie dienen nur dem UI-Prototyping und behaupten keine Supabase-Anbindung.

## KI-gestuetzte Entwicklung

Dieses Projekt wird unter intensiver Nutzung KI-gestuetzter Entwicklungswerkzeuge entwickelt. Konzeption, Anforderungen, Tests, technische Entscheidungen und Veroeffentlichung werden vom Projektverantwortlichen gesteuert.
