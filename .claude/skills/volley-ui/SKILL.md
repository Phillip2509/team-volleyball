---
name: volley-ui
description: Primärer Frontend-Workflow der Team-Volleyball-App für neue Screens, Screen-Redesigns, UI-/UX-Verbesserungen und größere Frontend-Aufgaben – von Freigabe über Konzept und Umsetzung bis zu Tests, Accessibility- und Visual-QA-Review. Verwenden bei jeder größeren sichtbaren UI-Arbeit.
---

# volley-ui – größere Frontend-Aufgaben kontrolliert umsetzen

Der primäre Workflow für neue Screens, Screen-Redesigns, UI-/UX-Verbesserungen und größere Frontend-Aufgaben. Qualitätsmaßstab: [references/frontend-quality-standard.md](references/frontend-quality-standard.md) – vor Beginn lesen und anwenden.

## Workflow

1. **Ausgangslage**: `git status --short` und `git branch --show-current` prüfen.
2. **Fremde Änderungen schützen**: uncommittete Änderungen, die nicht aus diesem Workflow stammen, niemals überschreiben oder verwerfen.
3. **Auftrag bestimmen**: Nutzerziel, betroffener Screen/Flow, erwartetes Ergebnis in wenigen Sätzen.
4. **Offene Fehler prüfen**: Besteht ein bekannter offener Fehler? Dann zuerst diesen abschließen (`/volley-fix`), kein UI-Ausbau parallel.
5. **Freigabe**: Subagent `volley-product-guardian` einsetzen.
6. **Nur bei `FREIGEGEBEN` fortfahren** – andere Ergebnisse samt Begründung berichten und stoppen.
7. **Bestand untersuchen**: Subagent `volley-explorer` für Screen, Navigation, Theme (`constants/theme.ts`) und Komponenten (`components/`).
8. **Leitung**: Subagent `volley-ui-director` einsetzen – er bestimmt Akzeptanzkriterien, Nicht-Ziele und welche der Frontend-Agenten nötig sind (nicht alle blind starten).
9. **Akzeptanzkriterien und Nicht-Ziele festhalten** (aus Schritt 8, ggf. geschärft).
10. **Konzept**: Subagent `volley-ui-ux-designer` ein konkretes UI-/UX-Konzept erstellen lassen (Hierarchie, Struktur, Komponenten, Zustände, Interaktionen).
11. **Konsistenzprüfung des Konzepts**: Subagent `volley-design-system-guardian` das Konzept gegen Tokens und bestehende Komponenten prüfen lassen – vor der Umsetzung.
12. **Umsetzung**: Subagent `volley-frontend-implementer` mit Konzept und Akzeptanzkriterien.
13. **Tests**: Subagent `volley-tester` (Typecheck `npx tsc --noEmit`, `npm run lint`; nur vorhandene Prüfungen).
14. **Technisches Review**: Subagent `volley-reviewer` auf den tatsächlichen Diff.
15. **Accessibility**: Subagent `volley-accessibility-reviewer`.
16. **Visuelle Qualität**: Subagent `volley-visual-qa-reviewer` – mit tatsächlich verfügbaren visuellen Belegen; sonst dokumentiert er "VISUELLE PRÜFUNG NICHT AUSGEFÜHRT".
17. **Motion**: Subagent `volley-motion-reviewer` **nur**, wenn Animationen betroffen sind.
18. **Reparieren**: BLOCKER- und IMPORTANT-Findings vom `volley-frontend-implementer` beheben lassen.
19. **Wiederholen**: Tests und betroffene Reviews nach Reparaturen erneut, bis keine BLOCKER/IMPORTANT offen sind.
20. **Abschlussbericht** erst bei grünem Zustand – nach dem Standard unten.

## Regeln

- Keine neue Funktion außerhalb der Akzeptanzkriterien.
- Bestehende Design-Tokens und Komponenten zuerst verwenden; kein Screen erfindet ein eigenes Design.
- Keine Abhängigkeiten installieren oder aktualisieren ohne ausdrückliche Freigabe.
- **Keine Behauptung einer visuellen Prüfung ohne echte visuelle Grundlage.**
- **Kein Commit und kein Push** ohne ausdrücklichen Auftrag in der aktuellen Nutzernachricht – dann `/volley-save` folgen.

## Abschlussbericht (verbindlich)

Ziel des Arbeitsblocks · betroffener Screen/Flow · umgesetzte Änderungen · geänderte Dateien · verwendete bestehende Komponenten und Tokens · neue Komponenten · berücksichtigte Zustände · Dark-Mode-Status · Light-Mode-Status · kleine Displaygrößen · Safe-Area- und Keyboard-Status · Accessibility-Ergebnis · visuelles QA-Ergebnis (oder "VISUELLE PRÜFUNG NICHT AUSGEFÜHRT") · ausgeführte Tests mit Ergebnis · Review-Findings · offene Probleme · Git-Status · klare Einschätzung: **abgeschlossen und commitbereit** / **nicht abgeschlossen** / **blockiert**.
