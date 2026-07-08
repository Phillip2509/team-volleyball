---
name: volley-polish
description: Qualitäts-Workflow der Team-Volleyball-App für bereits funktionierende Oberflächen, die professioneller, konsistenter und marktreifer werden sollen – ohne neue Produktfunktionen, maximal ein Screen oder Flow pro Durchlauf. Verwenden, wenn eine funktionierende UI poliert werden soll.
---

# volley-polish – funktionierende Oberfläche marktreif machen

Für eine bereits funktionierende Oberfläche, die professioneller, konsistenter und marktreifer werden soll. **Dieser Skill darf keine neue Produktfunktion hinzufügen** – nur Qualität, Konsistenz und Verständlichkeit verbessern. Qualitätsmaßstab: [../volley-ui/references/frontend-quality-standard.md](../volley-ui/references/frontend-quality-standard.md).

## Workflow

1. **Bestehendes Verhalten dokumentieren**: Was tut der Screen heute (inkl. Zustände)? `git status --short` prüfen, fremde uncommittete Änderungen schützen. Das dokumentierte Verhalten muss nach dem Polish unverändert sein.
2. **Probleme sammeln**: visuelle und UX-Probleme des Screens konkret auflisten (Datei, Stelle, Problem) – ggf. mit `volley-explorer`.
3. **Priorisieren**: Findings klassifizieren als BLOCKER / IMPORTANT / POLISH.
4. **Scope begrenzen**: **maximal einen klar abgegrenzten Screen oder Flow pro Durchlauf.** Weitere Screens als Folgeaufgaben notieren.
5. **Konsistenz-Referenz**: Subagent `volley-design-system-guardian` – welche Abweichungen von Tokens (`constants/theme.ts`) und bestehenden Komponenten gibt es?
6. **UX-Bewertung**: Subagent `volley-ui-ux-designer` – Hierarchie, Struktur und Verständlichkeit des Screens, begrenzt auf Verbesserung des Bestehenden.
7. **Nur freigegebene Verbesserungen umsetzen**: Subagent `volley-frontend-implementer` mit der priorisierten, abgegrenzten Liste – kleinster sinnvoller Diff, Verhalten unverändert.
8. **Dark und Light Mode prüfen**: jede geänderte Stelle in beiden Modi durchdenken bzw. prüfen lassen.
9. **Kleine und große Displays prüfen**: keine neuen festen Maße, lange Texte, Scrollbarkeit.
10. **Accessibility**: Subagent `volley-accessibility-reviewer`.
11. **Visual-QA**: Subagent `volley-visual-qa-reviewer` (echte Belege oder klar "VISUELLE PRÜFUNG NICHT AUSGEFÜHRT").
12. **Tests und Review**: Subagent `volley-tester` (Typecheck, Lint) und Subagent `volley-reviewer` auf den Diff; BLOCKER/IMPORTANT beheben und wiederholen.
13. **Abschlussbericht** nach dem Standard aus `/volley-ui`.

## Regeln

- **Keine reine Geschmacksänderung ohne nachvollziehbaren Nutzen** – jede Änderung muss sich auf Konsistenz, Verständlichkeit, Zustände, Accessibility oder Bedienbarkeit zurückführen lassen.
- Verhalten und Funktionsumfang bleiben identisch; nur Darstellung, Konsistenz und Verständlichkeit ändern sich.
- Bestehende Tokens und Komponenten verwenden; fehlende Tokens als Lücke melden statt Werte hart zu codieren.
- Keine neuen Abhängigkeiten.
- Kein Commit und kein Push ohne ausdrücklichen Auftrag in der aktuellen Nutzernachricht.
