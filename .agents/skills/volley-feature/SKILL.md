---
name: volley-feature
description: "Für eine neue Produktfunktion, neue Geschäftslogik, einen neuen Datenfluss oder eine neue Supabase-Funktion der Team-Volleyball-App verwenden. Nicht für bestehende Fehler, reines UI-Polish oder reine Release-Prüfungen."
---

# Volley Feature

## Zweck

Ein neues, klar abgegrenztes Produktfeature kontrolliert analysieren, implementieren, testen und reviewen.

## Nicht verwenden für

- bestehenden Bug oder Regression
- reine visuelle Verbesserung einer funktionierenden Oberfläche
- vollständigen Design-Audit
- reinen Abschluss- oder Release-Check
- ungeklärte große Produktidee ohne Scope

## Verbindlicher Ablauf

1. `volley-product-guardian` einsetzen.
2. Prüfen, ob ein älteres Paket offen ist.
3. Produktziel, Nutzerwert und aktuelle Version prüfen.
4. Akzeptanzkriterien definieren.
5. Nicht-Ziele definieren.
6. `volley-explorer` einsetzen.
7. Tatsächlichen Bestand und betroffene Dateien untersuchen.
8. Relevante Spezialagents auswählen.
9. Genau einen passenden Schreibagenten einsetzen:
   - `volley-implementer` für Produktlogik, Hooks, Services und Datenflüsse
   - `volley-frontend-implementer` für UI-dominante Umsetzung
10. `volley-tester` einsetzen.
11. `volley-reviewer` einsetzen.
12. Bei relevanter Auswirkung `volley-regression-reviewer` einsetzen.
13. Findings reparieren lassen.
14. Tests und Reviews wiederholen.
15. Erst bei grünem Zustand commitbereit melden.

## Supabase-Relevanz

Bei Datenmodell, RPC, RLS, Auth, Rollen oder Teamzugriff zusätzlich gezielt:

- `volley-supabase-specialist`
- `volley-security-reviewer`
- bei neuer Migration `volley-migration-reviewer`
- `volley-regression-reviewer`

Regeln:

- Migration nicht automatisch erstellen.
- Vor lokaler Migration muss der Auftrag dies ausdrücklich erlauben.
- Remote-Migration nie durch einen Agenten ausführen.
- Remote-Ausführung benötigt getrennte ausdrückliche Nutzerfreigabe.
- Lokale Migration, Remote-Ausführung und Remote-Test getrennt berichten.

## Dependency-Relevanz

Vor einer neuen Bibliothek:

1. `volley-dependency-guardian` einsetzen.
2. Nur bei Ergebnis FREIGEGEBEN weiterplanen.
3. Trotzdem keine Installation ohne ausdrückliche Genehmigung.

## Stop-Bedingungen

Mit BLOCKIERT stoppen, wenn:

- ein älteres Paket zuerst abgeschlossen werden muss
- Scope oder Akzeptanzkriterien unklar bleiben
- unerwartete Bestandsänderungen vorhanden sind
- Dependency oder Migration nötig ist, aber nicht freigegeben wurde
- notwendige Zugriffe oder Voraussetzungen fehlen

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
