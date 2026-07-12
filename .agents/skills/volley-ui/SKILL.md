---
name: volley-ui
description: "Für eine größere UI-/UX-Aufgabe, einen neuen Screen-Flow oder ein größeres Redesign der Team-Volleyball-App verwenden. Nicht für einen kleinen Einzelscreen-Fix oder reines Detail-Polish."
---

# Volley UI

## Zweck

Eine größere, zusammenhängende UI-/UX-Arbeit professionell planen, implementieren und auf reale Mobile-Nutzung prüfen.

## Typische Auslöser

- neuer zusammenhängender Flow
- mehrere betroffene Komponenten
- größerer Screen-Umbau
- neuer umfangreicher Screen
- visuelle Neuausrichtung eines Bereichs
- komplexes Formular oder Modal-System

## Nicht verwenden für

- Ein-Zeilen-Stylingfix
- reiner Bug ohne größere UI-Auswirkung
- genau ein überschaubarer Screen ohne Flow-Auswirkung
- reines Design-Audit ohne Umsetzung
- reines bestehendes UI-Polish

## Agentenauswahl

Typischer Pool, aber niemals automatisch alle:

- `volley-product-guardian`
- `volley-explorer`
- `volley-ui-director`
- `volley-ui-ux-designer`
- `volley-component-architect`
- `volley-state-ux-specialist`
- `volley-design-system-guardian`
- `volley-frontend-implementer`
- `volley-tester`
- `volley-reviewer`
- `volley-accessibility-reviewer`
- `volley-visual-qa-reviewer`
- `volley-device-qa-reviewer`
- `volley-motion-reviewer` nur bei relevanter Bewegung
- `volley-copy-ux-writer` bei relevanten Nutzertexten

## Verbindlicher Ablauf

1. Produkt- und UI-Scope abgrenzen.
2. Nutzerziel und Hauptaktion definieren.
3. Bestehenden Screen, Komponenten und Tokens untersuchen.
4. Informationshierarchie planen.
5. Reale Zustände planen.
6. Komponentenstruktur prüfen, falls echte Architektur betroffen ist.
7. Light Mode und Dark Mode planen.
8. kleine iPhones, Safe Areas, Tastatur und Scrollen berücksichtigen.
9. genau einen `volley-frontend-implementer` einsetzen.
10. technische Tests ausführen.
11. allgemeinen Review durchführen.
12. Accessibility prüfen.
13. visuelles QA mit echten Belegen durchführen.
14. Device-QA mit echten Belegen durchführen.
15. Motion nur prüfen, wenn Bewegung vorhanden oder geplant ist.
16. Findings reparieren und Prüfungen wiederholen.

## Reale Zustände

Mindestens prüfen, soweit relevant:

- Initial Loading
- Refresh
- Success
- Empty
- Partial Data
- Error
- Permission denied
- Disabled
- Saving
- Updating
- Retry
- lange Inhalte
- fehlende optionale Daten

## Belegpflicht

Ohne echte visuelle Grundlage muss stehen:

`VISUELLE PRÜFUNG NICHT AUSGEFÜHRT`

Ohne ausreichende Geräteprüfung muss stehen:

`DEVICE-QA NICHT VOLLSTÄNDIG AUSGEFÜHRT`

## Designregeln

- keine generische KI- oder SaaS-Dashboard-Optik
- keine zufälligen Gradients oder Schatten
- kein Glassmorphism ohne belegbaren Nutzen
- bestehende Tokens und Komponenten zuerst verwenden
- keine Fake-Funktionalität
- klare Hauptaktion
- sekundäre Aktionen zurückhaltend
- keine unnötigen Animationen

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
