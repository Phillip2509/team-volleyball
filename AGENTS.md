# Team Volleyball - Codex Project Instructions

## Projekt

- Projektpfad: `C:\Users\Stein\OneDrive\Desktop\Volleyball-Team-App\team-volleyball`
- Expo SDK 56
- React Native
- TypeScript
- Expo Router
- Supabase Auth
- Supabase PostgreSQL
- Row Level Security
- iOS Development Build
- Light Mode
- Dark Mode

## Verbindlicher Arbeitsmodus

- Immer nur ein klar abgegrenztes Arbeitspaket gleichzeitig.
- Bestehende offene Arbeit vor neuen Produktfeatures abschließen.
- Scope nicht eigenständig vergrößern.
- Keine ungeplanten Nebenfeatures.
- Vor Änderungen tatsächlichen Git-Stand prüfen.
- Höchstens ein schreibender Agent gleichzeitig.
- Read-only Agents dürfen nur bei unabhängigem Nutzen parallel arbeiten.
- Claude und Codex dürfen niemals gleichzeitig dieselben Dateien bearbeiten.
- Agentenergebnisse sind Hinweise und müssen vom Hauptagenten kritisch zusammengeführt werden.
- Spezialreviewer ersetzen nie den finalen allgemeinen Reviewer.

## Verbotene automatische Aktionen

- Keine Dependency ohne ausdrückliche Genehmigung.
- Keine Migration ohne klaren Auftrag.
- Keine Remote-Migration ohne ausdrückliche Freigabe.
- Keine Produktionsdatenbankänderung ohne Auftrag.
- Keine EAS-Builds oder kostenrelevanten Aktionen ohne Auftrag.
- Keine Secrets lesen oder ausgeben.
- Kein Commit ohne ausdrücklichen aktuellen Auftrag.
- Kein Push ohne ausdrücklichen aktuellen Auftrag.
- Kein Merge ohne ausdrücklichen aktuellen Auftrag.
- Kein Tag ohne ausdrücklichen aktuellen Auftrag.
- Keine destruktiven Git-Befehle.
- Keine ungefragten Änderungen an Claude-Konfigurationen.

## Qualität

- Tatsächlich ausgeführte Tests und Annahmen klar trennen.
- Keine erfolgreichen Tests behaupten, die nicht ausgeführt wurden.
- Keine visuelle Prüfung ohne reale visuelle Belege behaupten.
- Keine vollständige Device-QA-Prüfung nur anhand von Quellcode behaupten.
- Supabase-, Rollen-, Team-, RLS- und Berechtigungslogik besonders kritisch behandeln.
- Bestehende Komponenten und Design-Tokens zuerst verwenden.
- Keine generische KI-, SaaS- oder Template-Dashboard-Optik.
- Light Mode, Dark Mode, Safe Areas, Tastatur, Scrollen und kleine Displays berücksichtigen, wenn UI betroffen ist.

## Verbindliche Dokumentation

Vor relevanter Arbeit die passenden Dateien lesen:

- `docs/codex/agent-catalog.md`
- `docs/codex/workflows.md`
- `docs/codex/quality-gates.md`

Die dort beschriebenen Agents und Workflows gezielt einsetzen, niemals pauschal alle Agents starten.
