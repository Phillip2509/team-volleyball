---
name: volley-fix
description: Systematischer Bugfix-Workflow für die Team-Volleyball-App. Verwenden bei Fehlern, Regressionen und nicht funktionierenden bestehenden Funktionen – Diagnose mit volley-explorer, minimale Umsetzung mit volley-implementer, dann volley-tester und volley-reviewer bis zum grünen Zustand.
---

# volley-fix – Fehler systematisch beheben

Dieser Workflow gilt für Fehler, Regressionen und nicht funktionierende **bestehende** Funktionen der Team-Volleyball-App. Er folgt der zentralen Entwicklungsregel: verstehen → beheben → testen → Diff prüfen → sauber abschließen.

## Workflow

1. **Ausgangslage prüfen**: `git status --short` und aktuellen Branch (`git branch --show-current`) prüfen.
2. **Fremde Änderungen schützen**: Uncommittete Änderungen, die nicht aus diesem Workflow stammen, **niemals überschreiben oder verwerfen**. Falls solche existieren und den Fix behindern, den Nutzer informieren statt einzugreifen.
3. **Auftrag definieren**: In ein bis zwei Sätzen festhalten, was kaputt ist und was das erwartete Verhalten ist.
4. **Diagnose**: Subagent `volley-explorer` mit der Fehlerbeschreibung einsetzen. Er liefert Ursache, Datenfluss, betroffene Dateien und die kleinste empfohlene Lösung.
5. **Diagnose kritisch prüfen**: Stimmen die genannten Dateien und die Ursachenkette mit dem Code überein? Bei Zweifeln gezielt nachlesen, bevor implementiert wird.
6. **Umsetzen**: Subagent `volley-implementer` mit der **kleinsten geeigneten Lösung** und einem präzisen Auftrag einsetzen. Kein Refactoring, keine neuen Features innerhalb eines Fixes.
7. **Prüfen**: Subagent `volley-tester` ausführen (mindestens Typecheck `npx tsc --noEmit` und `npm run lint`).
8. **Review**: Subagent `volley-reviewer` auf den **tatsächlichen Diff** anwenden, mit dem ursprünglichen Auftrag als Kontext.
9. **Reparieren**: BLOCKER- und IMPORTANT-Findings vom `volley-implementer` beheben lassen.
10. **Wiederholen**: Nach Reparaturen Tests (Schritt 7) und Review (Schritt 8) erneut ausführen, bis keine BLOCKER/IMPORTANT mehr offen sind.
11. **Abschlussbericht**: Erst bei grünem Zustand berichten – Ursache, Lösung, geänderte Dateien, Testergebnisse, verbleibende MINOR-Findings.

## Regeln

- Bei einem reparierbaren Fehler **nicht sofort beim Nutzer nachfragen** – selbstständig diagnostizieren und beheben. Nachfragen nur, wenn das erwartete Verhalten wirklich unklar ist oder eine Produktentscheidung ansteht.
- Keine neuen Features innerhalb eines Fixes.
- Keine Abhängigkeiten installieren oder aktualisieren.
- Keine Supabase-Migrationen und keine Datenbankänderungen.
- **Kein Commit und kein Push**, außer der Nutzer fordert dies in seiner aktuellen Nachricht ausdrücklich – dann dem Workflow von `/volley-save` folgen.
