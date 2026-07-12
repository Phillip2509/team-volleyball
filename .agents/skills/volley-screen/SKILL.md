---
name: volley-screen
description: "Für genau einen neuen oder grundlegend überarbeiteten Screen beziehungsweise eine große einzelne Komponente verwenden. Nicht für komplette Multi-Screen-Flows oder kleine Detailverbesserungen."
---

# Volley Screen

## Zweck

Genau einen Screen oder eine klar abgegrenzte größere Komponente professionell planen und umsetzen.

## Scope-Regel

- genau ein Screen oder eine größere Einzelkomponente
- angrenzende Screens nur ändern, wenn technisch zwingend
- bestehende Navigation und Datenflüsse erhalten
- keine neuen Nebenfeatures
- kein kompletter App-Bereichsumbau

## Verbindlicher Ablauf

1. `volley-explorer` einsetzen.
2. Ziel, Hauptaktion und bestehendes Verhalten bestimmen.
3. `volley-ui-ux-designer` einsetzen.
4. `volley-state-ux-specialist` einsetzen, wenn Daten geladen oder gespeichert werden.
5. `volley-component-architect` nur einsetzen, wenn echte Wiederverwendung oder Komponentenarchitektur betroffen ist.
6. `volley-design-system-guardian` einsetzen.
7. genau einen `volley-frontend-implementer` einsetzen.
8. `volley-tester` einsetzen.
9. `volley-reviewer` einsetzen.
10. `volley-accessibility-reviewer` einsetzen.
11. `volley-visual-qa-reviewer` mit realem Beleg einsetzen.
12. bei Formularen, Overlays, Tastatur oder komplexem Layout `volley-device-qa-reviewer` einsetzen.
13. Findings reparieren und relevante Prüfungen wiederholen.

## Zu prüfende Zustände

Soweit relevant:

- Loading
- Empty
- Error
- Partial Data
- Disabled
- Saving
- Permission denied
- lange Texte und Namen
- kleine Displays
- Light und Dark Mode
- Tastatur
- Safe Areas
- Scrollen
- Dynamic Type

## Abgrenzung zu volley-ui

Nutze `volley-ui` statt `volley-screen`, wenn:

- mehrere Screens betroffen sind
- ein vollständiger Flow verändert wird
- mehrere zusammenhängende Komponenten neu strukturiert werden
- die visuelle Richtung eines ganzen Bereichs geändert wird

## Vorbereitung

1. Lies zuerst:
   - `AGENTS.md`
   - `docs/codex/agent-catalog.md`
   - `docs/codex/workflows.md`
   - `docs/codex/quality-gates.md`
2. Prüfe:
   - `git branch --show-current`
   - `git status`
   - `git log -5 --oneline --decorate`
3. Verstehe den aktuellen Auftrag vollständig.
4. Prüfe, ob bereits ein älteres Arbeitspaket offen ist.
5. Lege Scope, Akzeptanzkriterien und Nicht-Ziele fest, soweit für den Skill relevant.

## Agentennutzung

- Starte Agents nur bei tatsächlicher fachlicher Relevanz.
- Starte niemals pauschal alle Agents.
- Höchstens ein schreibender Agent gleichzeitig.
- Mehrere read-only Agents nur bei voneinander unabhängigen Prüfungen.
- Claude und Codex dürfen nicht gleichzeitig dieselben Dateien bearbeiten.
- Der Hauptagent bleibt für Scope, Produktentscheidungen, Zusammenführung und Abschluss verantwortlich.
- Spezialreviewer ersetzen niemals den finalen allgemeinen `volley-reviewer`.
- Agentenberichte müssen kritisch anhand des tatsächlichen Bestands geprüft werden.

## Verbotene automatische Aktionen

Ohne ausdrücklichen aktuellen Nutzerauftrag:

- keine Dependency installieren
- keine Migration erstellen
- keine Migration remote ausführen
- keine Produktionsdatenbank verändern
- keinen EAS-Build starten
- keine Zertifikats- oder Provisioning-Aktion
- keinen Commit erstellen
- nicht pushen
- nicht mergen
- keinen Tag erstellen
- keine destruktiven Git-Befehle

## Qualität

- Nur tatsächlich ausgeführte Tests als ausgeführt melden.
- Keine visuelle Prüfung ohne reale visuelle Belege behaupten.
- Keine vollständige Device-QA nur anhand von Quellcode behaupten.
- Annahmen, statische Ableitungen und geprüfte Fakten klar trennen.
- Findings konkret mit Datei, Stelle, Auswirkung und kleinster Lösung melden.
- BLOCKER und IMPORTANT müssen vor Abschluss behoben oder ausdrücklich als Blockade gemeldet werden.

## Abschlussbericht

Jeder Skill endet mit:

1. Ziel
2. Ausgangszustand
3. verwendeter Skill
4. eingesetzte Agents
5. Diagnose beziehungsweise Plan
6. umgesetzte Änderungen oder geprüfte Bereiche
7. geänderte Dateien
8. ausgeführte Tests und echte Ergebnisse
9. Review-Findings
10. reparierte Findings
11. offene Probleme und Risiken
12. Git-Status
13. klare Abschlusseinschätzung:
   - ABGESCHLOSSEN UND COMMITBEREIT
   - NICHT ABGESCHLOSSEN
   - BLOCKIERT

Bei vollständig read-only Skills muss statt umgesetzte Änderungen ausdrücklich stehen, dass keine Dateien verändert wurden.
