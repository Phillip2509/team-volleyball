---
name: volley-screen
description: Kompakter Frontend-Workflow der Team-Volleyball-App für einen klar abgegrenzten einzelnen Screen oder eine einzelne UI-Komponente – kleines Konzept, Umsetzung, Design-System-, Accessibility- und Visual-QA-Prüfung. Verwenden bei kleinen, klar umrissenen UI-Aufgaben; für größere Aufgaben /volley-ui verwenden.
---

# volley-screen – ein einzelner Screen oder eine einzelne Komponente

Kompakter Workflow für einen klar abgegrenzten einzelnen Screen oder eine einzelne UI-Komponente. Für größere oder screenübergreifende Aufgaben stattdessen `/volley-ui` verwenden. Qualitätsmaßstab: [../volley-ui/references/frontend-quality-standard.md](../volley-ui/references/frontend-quality-standard.md).

## Workflow

1. **Screen identifizieren**: betroffene Datei in `app/` bzw. Komponente in `components/` benennen; `git status --short` prüfen, fremde uncommittete Änderungen schützen.
2. **Nutzerziel und Hauptaktion definieren**: je ein Satz.
3. **Bestand prüfen**: existierende Komponenten (`components/`) und Tokens (`constants/theme.ts`), die verwendet oder erweitert werden können.
4. **Vorhandene Zustände dokumentieren** – was der Screen heute zeigt bei:
   - loading (initial)
   - empty
   - error
   - success
   - disabled
   - partial data
5. **Kleines Konzept**: Subagent `volley-ui-ux-designer` – begrenzt auf diesen Screen/diese Komponente.
6. **Umsetzung**: Subagent `volley-frontend-implementer` mit dem Konzept und minimalem Diff.
7. **Design-System-Review**: Subagent `volley-design-system-guardian` auf den Diff.
8. **Accessibility-Review**: Subagent `volley-accessibility-reviewer`.
9. **Tests**: Subagent `volley-tester` (Typecheck `npx tsc --noEmit`, `npm run lint`).
10. **Visual-QA**: Subagent `volley-visual-qa-reviewer` (mit echten visuellen Belegen oder klar dokumentiert als nicht ausgeführt).
11. **BLOCKER/IMPORTANT beheben** und betroffene Prüfungen wiederholen.
12. **Abschlussbericht** nach dem Standard aus `/volley-ui` (inkl. Zustände, Dark/Light Mode, Git-Status, Einschätzung commitbereit / nicht abgeschlossen / blockiert).

## Regeln

- **Kein Umbau angrenzender Screens**, sofern nicht zwingend notwendig – falls doch nötig, das ausdrücklich begründen und im Bericht ausweisen.
- Keine neuen Funktionen, keine neuen Abhängigkeiten, keine neuen Farben/Abstände außerhalb der Tokens.
- Kein Commit und kein Push ohne ausdrücklichen Auftrag in der aktuellen Nutzernachricht.
