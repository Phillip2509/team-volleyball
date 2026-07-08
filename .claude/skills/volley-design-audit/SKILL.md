---
name: volley-design-audit
description: Read-only Design- und UX-Audit des gesamten Frontends der Team-Volleyball-App – erfasst Themes, Tokens, Komponenten und Screens, findet Inkonsistenzen, UX- und Accessibility-Risiken und liefert eine priorisierte Roadmap ohne jede Umsetzung. Verwenden für Bestandsaufnahme und Priorisierung der Frontend-Arbeit.
---

# volley-design-audit – Read-only Audit des App-Frontends

Vollständige Bestandsaufnahme der Frontend-Qualität. **Dieser Skill verändert keine App-Dateien** – Ergebnis ist ausschließlich ein Bericht mit priorisierter Roadmap. Qualitätsmaßstab: [../volley-ui/references/frontend-quality-standard.md](../volley-ui/references/frontend-quality-standard.md).

## Workflow

1. **Designstruktur untersuchen**: `constants/theme.ts` (Tokens), `context/theme-context.tsx`, `hooks/use-theme-styles.ts`, Styling-Muster in den Komponenten.
2. **Themes, Tokens und Komponenten erfassen**: vollständige Liste der vorhandenen Tokens (spacing, radius, fontSizes, shadows, ThemeColors) und wiederverwendbaren Komponenten in `components/` mit ihrem Zweck.
3. **Wichtigste Screens identifizieren**: `app/(tabs)/` (Start, Termine, Team, Nachrichten, Einstellungen) sowie `login`, `setup`, `profile-setup`, `team-onboarding` – nach Nutzerrelevanz ordnen.
4. **Inkonsistenzen finden**: hart codierte Farben/Abstände statt Tokens, abweichende Typografie, duplizierte Muster statt Komponenten – ggf. Subagent `volley-design-system-guardian` über die Screens laufen lassen.
5. **UX-Probleme finden**: unklare Hauptaktionen, überladene Screens, verwirrende Abläufe, unverständliche Texte – ggf. Subagent `volley-ui-ux-designer` je Kern-Screen.
6. **Accessibility-Risiken finden**: Subagent `volley-accessibility-reviewer` über die wichtigsten Screens.
7. **Dark-/Light-Mode-Probleme finden**: Farben, die nur in einem Modus funktionieren; fehlende Theme-Nutzung.
8. **Navigation und Zustände prüfen**: sind Lade-, Fehler-, leere und Teilzustände auf jedem datenabhängigen Screen vorhanden? Führt die Navigation immer nachvollziehbar zurück?
9. **Technische Frontend-Schulden erfassen**: unnötige Re-Renders, fehlende Virtualisierung bei Listen, tote Styles, Inline-Style-Wildwuchs.
10. **Priorisierte Roadmap erstellen**: konkrete Arbeitspakete in empfohlener Reihenfolge, jeweils klein genug für `/volley-screen` oder `/volley-polish`.

## Ausgabe (verbindlich)

1. **Aktueller Design-Stand** (Tokens, Komponenten, Muster – was existiert und wie konsequent es genutzt wird).
2. **Stärken** des bestehenden Frontends.
3. **Findings** gruppiert als BLOCKER / IMPORTANT / POLISH, je mit Datei/Screen, Problem und Auswirkung.
4. **Wiederverwendbare Komponenten** (vorhanden und sinnvoll fehlende).
5. **Fehlende Design-Tokens** (Lücken im System).
6. **Inkonsistente Screens** (welche Screens weichen am stärksten ab).
7. **Empfohlene Reihenfolge** der Arbeitspakete mit passendem Skill je Paket.
8. **Ausdrücklich: keine Umsetzung** – der Audit endet mit dem Bericht; jede Umsetzung ist ein separater Auftrag.

## Regeln

- Nur lesende Werkzeuge und lesende Git-Befehle; keine Dateiänderungen, keine Installationen, keine Builds.
- Keine erfundenen Probleme: jedes Finding mit konkreter Datei und Begründung.
- Keine Secrets lesen oder ausgeben.
