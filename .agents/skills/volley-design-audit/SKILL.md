---
name: volley-design-audit
description: "Für eine vollständig read-only Bestandsaufnahme der visuellen Qualität, Komponenten, Zustände, Accessibility und Gerätefestigkeit verwenden. Nicht für Implementierung oder direkte UI-Änderungen."
---

# Volley Design Audit

## Zweck

Die bestehende UI vollständig read-only analysieren und konkrete priorisierte Verbesserungen liefern.

## Strikter Modus

- keine Dateien verändern
- keine Formatierung ausführen
- keine automatische Reparatur
- keinen Schreibagenten einsetzen
- keine Dependency installieren
- keine Screens oder Komponenten neu erstellen
- nur analysieren, prüfen und berichten

## Mögliche Agents

Nur bei Relevanz auswählen:

- `volley-explorer`
- `volley-ui-director`
- `volley-ui-ux-designer`
- `volley-component-architect`
- `volley-state-ux-specialist`
- `volley-design-system-guardian`
- `volley-accessibility-reviewer`
- `volley-visual-qa-reviewer`
- `volley-device-qa-reviewer`
- `volley-motion-reviewer`
- `volley-copy-ux-writer`
- `volley-reviewer` als finaler allgemeiner Reviewer

## Prüffelder

- professionelle Gesamtwirkung
- klare Hauptaktion
- Informationshierarchie
- Typografie
- Spacing
- Radien, Borders und Schatten
- Farben in Light und Dark Mode
- bestehende Komponenten und Duplikate
- Lade-, Leer-, Fehler- und Disabled-Zustände
- Accessibility
- Touch-Flächen
- Dynamic Type
- kleine iPhones
- Safe Areas
- Tastatur
- Scrollen
- Modals und Overlays
- lange deutsche Texte
- Motion, soweit vorhanden

## Belegpflicht

Ohne reale visuelle Belege:

`VISUELLE PRÜFUNG NICHT AUSGEFÜHRT`

Ohne ausreichende Gerätebelege:

`DEVICE-QA NICHT VOLLSTÄNDIG AUSGEFÜHRT`

## Ausgabe

1. geprüfte Screens und Dateien
2. verfügbare visuelle Belege
3. Design-System-Bestand
4. Komponentenbestand
5. Zustandsabdeckung
6. Accessibility
7. Device-QA
8. Findings: BLOCKER, IMPORTANT oder POLISH
9. pro Finding: Screen, Datei und Stelle, Auswirkung, Beleg, kleinste sinnvolle Lösung
10. empfohlene Arbeitspakete in sinnvoller Reihenfolge
11. Bestätigung, dass keine Dateien verändert wurden

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
