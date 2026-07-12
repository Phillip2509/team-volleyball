---
name: volley-fix
description: "Für einen bestehenden Fehler, eine Regression, einen Absturz, falsches Datenverhalten oder nicht funktionierende Navigation verwenden. Nicht für neue Produktfunktionen oder reines visuelles Polish."
---

# Volley Fix

## Zweck

Die tatsächliche Ursache eines vorhandenen Fehlers finden und mit dem kleinstmöglichen sicheren Diff beheben.

## Nicht verwenden für

- neues Feature
- neue Nutzerfähigkeit
- gewünschtes Redesign ohne Funktionsfehler
- reine Veröffentlichungsvorbereitung

## Verbindlicher Ablauf

1. Fehlerbild exakt erfassen.
2. Reproduktionsschritte und erwartetes Verhalten definieren.
3. `volley-explorer` einsetzen.
4. Ursache statt nur Symptom ermitteln.
5. Betroffene und angrenzende Flows bestimmen.
6. Bei Fachrelevanz Spezialagents einsetzen:
   - Supabase/Auth/RLS: `volley-supabase-specialist` und `volley-security-reviewer`
   - iOS: `volley-native-ios-specialist`
   - Performance: `volley-performance-reviewer`
   - UI-Zustände: `volley-state-ux-specialist`
7. Genau einen passenden Implementer einsetzen.
8. Nur die Ursache und notwendige Folgeanpassungen ändern.
9. `volley-tester` einsetzen.
10. `volley-regression-reviewer` einsetzen.
11. `volley-reviewer` einsetzen.
12. Findings reparieren.
13. betroffene Tests und Reviews wiederholen.

## Fix-Regeln

- Kein während wir schon dabei sind-Refactoring.
- Keine neue Produktfunktion.
- Keine Architekturänderung ohne nachgewiesene Notwendigkeit.
- Keine Dependency ohne Freigabe.
- Keine Migration ohne ausdrücklichen Auftrag.
- Bestehende funktionierende Flows erhalten.
- Bei nicht reproduzierbarem Fehler keine spekulative Änderung durchführen.

## Stop-Bedingungen

Mit BLOCKIERT stoppen, wenn:

- Fehler nicht ausreichend beschrieben oder reproduzierbar ist
- tatsächliche Ursache nicht bestimmt werden kann
- Fix eine nicht freigegebene Migration oder Dependency benötigt
- Working Tree unerwartete Änderungen enthält
- Zugriff auf notwendige reale Daten oder Plattform nicht vorhanden ist

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
