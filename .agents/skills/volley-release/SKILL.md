---
name: volley-release
description: "Für die Prüfung der Veröffentlichungs- und Releasebereitschaft eines abgeschlossenen App-Stands verwenden. Nicht für normale Feature-Speicherung, neue Implementierung oder einen automatischen Build."
---

# Volley Release

## Zweck

Prüfen, ob ein definierter App-Stand tatsächlich für Preview Build, TestFlight oder spätere Veröffentlichung vorbereitet ist.

Der Skill führt nicht automatisch einen Release aus.

## Abgrenzung zu volley-save

`volley-save`:

- schließt ein einzelnes Arbeitspaket technisch ab
- prüft Commitbereitschaft
- kann bei ausdrücklichem Auftrag Commit oder Push vorbereiten

`volley-release`:

- prüft einen vollständigen Release-Kandidaten
- betrachtet Versionierung, Builds, Migrationen, Security und Veröffentlichungsvoraussetzungen
- führt nicht automatisch Build, Upload, Merge oder Tag aus

## Verbindlicher Ablauf

1. Scope des geplanten Releases festlegen.
2. `volley-release-manager` einsetzen.
3. Git-Stand, Branch und unerwartete Dateien prüfen.
4. Versions- und Build-Konfiguration prüfen.
5. Teststatus prüfen.
6. `volley-tester` einsetzen.
7. `volley-reviewer` einsetzen.
8. `volley-regression-reviewer` einsetzen.
9. Bei Relevanz:
   - `volley-security-reviewer`
   - `volley-migration-reviewer`
   - `volley-supabase-specialist`
   - `volley-native-ios-specialist`
   - `volley-dependency-guardian`
   - `volley-accessibility-reviewer`
   - `volley-device-qa-reviewer`
10. offene BLOCKER und IMPORTANT Findings sammeln.
11. fehlende manuelle iPhone-Tests benennen.
12. Releaseentscheidung treffen.

## Zu prüfen

- Working Tree
- richtiger Branch
- erwarteter Commitumfang
- Tests und Lint
- offene Reviews
- lokale und remote Migrationen
- RLS und Security bei relevanten Änderungen
- EAS-Konfiguration
- Bundle Identifier
- Build Number und Version, soweit relevant
- benötigte Berechtigungen
- Info.plist und Entitlements bei nativen Änderungen
- Development-, Preview- oder Production-Build-Ziel
- manuelle iPhone-Tests
- bekannte offene Risiken
- Dokumentation
- Tags und Merge-Voraussetzungen

## Release-Aktionen nur nach separater Freigabe

Der Skill darf nicht automatisch:

- Build starten
- Zertifikate ändern
- Provisioning ändern
- App Store Connect bedienen
- Migration remote ausführen
- committen
- pushen
- mergen
- taggen

Jede tatsächliche Aktion benötigt einen getrennten ausdrücklichen Nutzerauftrag.

## Release-Ausgabe

Zusätzlich zum allgemeinen Abschlussbericht:

1. Releaseziel
2. geprüfter Commit oder Branch
3. Version und Buildstand
4. Teststatus
5. Migrationsstatus
6. Securitystatus
7. iOS- und EAS-Status
8. manuelle Prüfungen
9. offene BLOCKER
10. offene IMPORTANT Findings
11. Release-Einschätzung: RELEASEBEREIT, NICHT RELEASEBEREIT oder BLOCKIERT

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
