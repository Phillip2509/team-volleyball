---
name: volley-feature
description: Systematischer Feature-Workflow für die Team-Volleyball-App. Verwenden für neue Funktionen oder größere Änderungen – erst Freigabe durch volley-product-guardian, dann Akzeptanzkriterien, kleiner Plan, Umsetzung mit volley-implementer und Absicherung durch volley-tester und volley-reviewer.
---

# volley-feature – neue Funktion kontrolliert umsetzen

Dieser Workflow gilt für neue Funktionen und größere Änderungen an der Team-Volleyball-App. Grundsatz: keine parallelen halbfertigen Baustellen – erst freigeben lassen, dann klein und vollständig umsetzen.

## Workflow

1. **Ausgangslage prüfen**: `git status --short` und aktuellen Branch (`git branch --show-current`) prüfen. Uncommittete fremde Änderungen niemals überschreiben.
2. **Freigabe einholen**: Subagent `volley-product-guardian` mit der Feature-Beschreibung einsetzen.
3. **Nur bei `FREIGEGEBEN` fortfahren.** Bei `KLEINER SCHNEIDEN`, `ZUERST OFFENES PROBLEM ABSCHLIESSEN` oder `NICHT FÜR DIE AKTUELLE VERSION` das Ergebnis samt Begründung an den Nutzer berichten und stoppen (bzw. den vorgeschlagenen kleineren Schnitt anbieten).
4. **Akzeptanzkriterien und Nicht-Ziele festhalten**: prüfbare Kriterien (Was muss funktionieren? Welche Zustände: laden, Fehler, leer? Light und Dark Mode? iOS?) und explizit, was NICHT Teil dieses Features ist.
5. **Architektur untersuchen**: Subagent `volley-explorer` einsetzen, um betroffene Screens (`app/`), Contexts (`context/`), Komponenten (`components/`) und ggf. das Supabase-Datenmodell (`supabase/migrations/`) zu klären.
6. **Kleinen Implementierungsplan erstellen**: wenige, nachvollziehbare Schritte; jeder Schritt klein und testbar.
7. **Umsetzen**: Subagent `volley-implementer` mit Plan und Akzeptanzkriterien einsetzen.
8. **Prüfen**: Subagent `volley-tester` ausführen (mindestens Typecheck `npx tsc --noEmit` und `npm run lint`).
9. **Review**: Subagent `volley-reviewer` auf den tatsächlichen Diff anwenden, mit Akzeptanzkriterien und Nicht-Zielen als Kontext.
10. **Reparieren und wiederholen**: BLOCKER- und IMPORTANT-Findings beheben lassen, danach Tests und Review erneut ausführen, bis der Zustand grün ist.
11. **Abschlussbericht**: umgesetzte Akzeptanzkriterien, geänderte Dateien, Testergebnisse, offene MINOR-Findings, bewusst ausgelassene Nicht-Ziele.

## Regeln

- **Keine weiteren Funktionen hinzufügen, die nicht Teil der Akzeptanzkriterien sind** – auch nicht "wenn man schon dabei ist".
- Keine Abhängigkeiten installieren oder aktualisieren ohne ausdrückliche Genehmigung des Nutzers.
- Keine Supabase-Migrationen ausführen; neue Migrationsdateien nur, wenn das Feature es zwingend erfordert und der Nutzer es weiß.
- Keine Secrets lesen oder ausgeben.
- **Kein Commit und kein Push** ohne ausdrücklichen Auftrag in der aktuellen Nachricht des Nutzers – dann dem Workflow von `/volley-save` folgen.
