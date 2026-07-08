# Team Volleyball App

Ernsthafte Team-Volleyball-App (Mitglieder, Rollen, Events, Anwesenheit), die als veröffentlichbares Produkt entwickelt wird. UI-Sprache ist Deutsch. iOS ist wichtiges Zielsystem.

## Tech-Stack (Ist-Stand)

- Expo SDK 56, React Native 0.85, React 19, Expo Router (Typed Routes aktiv), React Compiler aktiv
- TypeScript `strict`, Pfad-Alias `@/*` (Projektwurzel)
- Supabase (`@supabase/supabase-js`) über `lib/supabase.ts`; Client kann `null` sein (Demo-Mode, wenn Env-Variablen fehlen) – immer absichern
- Light und Dark Mode über `context/theme-context.tsx`, Farben aus `constants/theme.ts` – keine hart codierten Farben
- Untere Tab-Navigation in `app/(tabs)/`, Auth-/Onboarding-Guards in `app/_layout.tsx` (`Stack.Protected`)

## Struktur

- `app/` – Screens/Routen (Expo Router): `(tabs)/{index,events,team,messages,settings}`, `login`, `setup`, `profile-setup`, `team-onboarding`
- `context/` – React Contexts: `auth-context`, `team-context`, `event-context`, `theme-context`
- `components/` – wiederverwendbare UI-Bausteine (`card`, `screen-container`, `empty-state`, `event-card`, …)
- `lib/supabase.ts` – Supabase-Client und Konfig-Validierung
- `supabase/migrations/` – SQL-Migrationen (Teams/Mitgliedschaften, Rollenverwaltung, Events/Antworten)
- `constants/theme.ts`, `hooks/use-theme-styles.ts` – Theming

## Vorhandene Prüfungen

- Lint: `npm run lint` (expo lint)
- Typecheck: `npx tsc --noEmit` (kein eigenes Script vorhanden)
- Es gibt derzeit kein Test-Script. Keine Prüfungen erfinden, die nicht existieren.

## Arbeitsweise (verbindlich)

Dieses Projekt wird strikt systematisch entwickelt: Problem vollständig verstehen → Ursache beheben → testen → Diff prüfen → sauber speichern → erst dann das nächste Thema.

- **Bestehende Probleme vor neuen Features abschließen.** Wenn ein offener Fehler existiert, kein neues Feature beginnen.
- **Kleine, abgeschlossene Arbeitspakete** – keine parallele Sammlung halbfertiger Features, Änderungen klein, nachvollziehbar und testbar halten.
- **Tests und Review vor jedem Commit** (Typecheck, Lint, `volley-reviewer`).
- **Keine eigenmächtigen Abhängigkeiten**: nichts installieren oder aktualisieren ohne ausdrückliche Genehmigung.
- **Keine Supabase-Produktionsänderungen**: keine Migrationen ausführen, keine Datenbankeingriffe ohne ausdrücklichen Auftrag.
- **Keine Secrets ausgeben**: `.env` nicht lesen oder zitieren; `.env.example` ist die Referenz.
- **Kein Commit und kein Push** ohne ausdrücklichen Auftrag in der aktuellen Nachricht.

## Workflows und Subagents

- `/volley-fix` – für Fehler, Regressionen und kaputte bestehende Funktionen
- `/volley-feature` – für neue Funktionen und größere Änderungen (startet mit Freigabeprüfung)
- `/volley-save` – für Abschluss, Prüfung und Speicherung eines Arbeitsstands

Subagents passend zum Workflow einsetzen – nicht alle blind starten:

- `volley-explorer` (Diagnose, nur lesend) – vor jeder Implementierung bei unklarer Ursache
- `volley-product-guardian` (Freigabe, nur lesend) – vor Features und größeren Änderungen
- `volley-implementer` (Umsetzung) – nur mit klar definiertem Auftrag
- `volley-tester` (Prüfungen) – nach jeder Implementierung
- `volley-reviewer` (Diff-Review, nur lesend) – vor jedem Abschluss oder Commit

**Keine automatische Feature-Erweiterung**: Nichts umsetzen, was nicht Teil des Auftrags bzw. der Akzeptanzkriterien ist – auch nicht "wenn man schon dabei ist".

## Frontend- und Produktqualität

Das Frontend ist ein zentraler Produktbereich: Die App soll als echtes Produkt veröffentlicht werden und darf nicht wie ein Template oder eine Hobby-App wirken. Qualitätsmaßstab: `.claude/skills/volley-ui/references/frontend-quality-standard.md`.

Workflows:

- **Neue oder überarbeitete Screens** und größere Frontend-Aufgaben → `/volley-ui`
- **Ein einzelner kleiner Screen oder eine einzelne Komponente** → `/volley-screen`
- **Reine Qualitätsverbesserung** einer funktionierenden Oberfläche → `/volley-polish`
- **Design-/UX-Bestandsaufnahme** (read-only) → `/volley-design-audit`

Frontend-Subagents (passend zum Workflow, nicht alle blind starten):

- `volley-ui-director` (Leitung größerer Frontend-Aufgaben, nur lesend)
- `volley-ui-ux-designer` (konkretes UI-/UX-Konzept, nur lesend)
- `volley-frontend-implementer` (Umsetzung von Frontend-Aufträgen)
- `volley-design-system-guardian` (Konsistenzprüfung, nur lesend)
- `volley-accessibility-reviewer` (Accessibility, nur lesend)
- `volley-visual-qa-reviewer` (visuelle Qualität, nur lesend)
- `volley-motion-reviewer` (Animationen, nur lesend, nur bei Bedarf)

Verbindliche Frontend-Regeln:

- **Bestehende Design-Tokens und Komponenten zuerst verwenden** (`constants/theme.ts`, `components/`). Kein Screen darf isoliert ein eigenes Design erfinden.
- **Dark und Light Mode** bei jeder sichtbaren Änderung berücksichtigen.
- **Lade-, Fehler- und leere Zustände** bei jedem datenabhängigen Screen berücksichtigen.
- **Accessibility berücksichtigen** (Touch-Flächen, Labels, Kontrast, Screenreader).
- **Keine neuen Dependencies ohne ausdrückliche Freigabe.**
- **Keine visuelle Prüfung behaupten, wenn keine durchgeführt wurde** – dann klar "VISUELLE PRÜFUNG NICHT AUSGEFÜHRT" dokumentieren.
- **Jeder vollständige Auftrag endet mit einem strukturierten Abschlussbericht** (Ziel, Änderungen, Dateien, Zustände, Dark/Light, Accessibility, Visual-QA, Tests, Findings, Git-Status, Einschätzung).
- **Kein Commit und kein Push ohne ausdrücklichen aktuellen Auftrag.**
