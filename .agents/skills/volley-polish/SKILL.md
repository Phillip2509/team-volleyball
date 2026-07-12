---
name: volley-polish
description: "Für die gezielte Verbesserung einer bereits funktionierenden Oberfläche verwenden: Hierarchie, Typografie, Spacing, Zustände und Accessibility. Nicht für neue Funktionen, neue Navigation oder neue Datenflüsse."
---

# Volley Polish

## Zweck

Eine bereits funktionierende Oberfläche gezielt professioneller, klarer und konsistenter machen, ohne Produktlogik oder Datenfluss zu verändern.

## Erlaubt

- Informationshierarchie verbessern
- Typografie korrigieren
- Spacing und Radien vereinheitlichen
- bestehende Farben und Tokens korrekt nutzen
- Loading-, Empty-, Error- und Disabled-Zustände verbessern
- Accessibility verbessern
- Touch-Flächen verbessern
- lange Texte besser behandeln
- kleine Displays stabilisieren
- Light und Dark Mode angleichen
- Pressed States verbessern
- verständliche UX-Texte verbessern

## Nicht erlaubt

- neue Produktfunktion
- neuer Datenfluss
- neue Supabase-Abfrage
- neues Datenmodell
- neue Navigation
- neue Berechtigungslogik
- neue Dependency
- vollständige Neugestaltung ohne belegbaren Nutzen
- Fake-Funktionalität

## Typischer Ablauf

1. `volley-explorer`
2. bei Bedarf `volley-ui-ux-designer`
3. `volley-design-system-guardian`
4. `volley-state-ux-specialist` bei datenabhängigem Screen
5. `volley-copy-ux-writer` bei sichtbaren Texten
6. genau ein `volley-frontend-implementer`
7. `volley-tester`
8. `volley-reviewer`
9. `volley-accessibility-reviewer`
10. `volley-visual-qa-reviewer`
11. `volley-device-qa-reviewer` bei relevanten Gerätebedingungen
12. Findings reparieren und erneut prüfen

## Belegpflicht

Ohne echte Screenshots oder laufende App:

`VISUELLE PRÜFUNG NICHT AUSGEFÜHRT`

Ohne reale Device-Prüfung:

`DEVICE-QA NICHT VOLLSTÄNDIG AUSGEFÜHRT`

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
