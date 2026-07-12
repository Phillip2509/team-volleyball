---
name: volley-save
description: "Für den technischen Abschluss und die optionale ausdrücklich beauftragte Speicherung eines bereits umgesetzten Arbeitspakets verwenden. Nicht für neue Features, neue Implementierungen oder Veröffentlichungsvorbereitung."
---

# Volley Save

## Zweck

Ein bereits umgesetztes Arbeitspaket vollständig prüfen und nur bei grünem Zustand für Commit beziehungsweise Push vorbereiten.

## Voraussetzungen

- fachlicher Scope ist bereits umgesetzt
- kein neues Feature soll begonnen werden
- notwendige iPhone- oder manuelle Tests wurden benannt
- Migrationen sind klar als lokal, remote oder getestet gekennzeichnet

## Verbindlicher Ablauf

1. Git-Stand prüfen.
2. Tatsächlichen Diff und alle untracked Dateien prüfen.
3. Scope gegen geänderte Dateien abgleichen.
4. Unerwartete Änderungen identifizieren.
5. `volley-tester` einsetzen.
6. `volley-reviewer` einsetzen.
7. Bei Bedarf Spezialreviews:
   - `volley-regression-reviewer`
   - `volley-security-reviewer`
   - `volley-migration-reviewer`
   - `volley-accessibility-reviewer`
   - `volley-release-manager`
8. Offene BLOCKER und IMPORTANT Findings reparieren.
9. Tests und Reviews wiederholen.
10. Working Tree und geplanten Commitumfang berichten.

## Technische Mindestprüfungen

Soweit für das Paket relevant:

- `npx tsc --noEmit`
- `npm.cmd run lint`
- `git diff --check`
- `git diff --stat`
- `git status --short`
- `git diff --name-only`
- tatsächlicher Diff

Keine Prüfung behaupten, die nicht ausgeführt wurde.

## Commit und Push

- Commit nur ausführen, wenn der aktuelle Nutzerauftrag ausdrücklich einen Commit verlangt.
- Push nur ausführen, wenn der aktuelle Nutzerauftrag ausdrücklich einen Push verlangt.
- Ein früherer allgemeiner Wunsch gilt nicht automatisch als aktuelle Freigabe.
- Merge und Tag gehören nicht automatisch zu `volley-save`.
- Vor Commit Commitumfang und Commitmessage nennen.
- Nach Commit Status und Log erneut prüfen.

## Supabase-Abschluss

Klar unterscheiden:

- lokale Migration vorhanden
- Migration committed
- Migration gepusht
- Migration remote ausgeführt
- Migration remote getestet

Ein Paket mit notwendiger, aber noch nicht remote geprüfter Migration darf nicht fälschlich als vollständig abgeschlossen bezeichnet werden.

## Nicht erlaubt

- neue Produktfunktion beginnen
- ungeplante Refactorings
- Änderungen nur zur Verschönerung
- fehlgeschlagene Tests ignorieren
- ungeprüft committen
- automatisch pushen

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
