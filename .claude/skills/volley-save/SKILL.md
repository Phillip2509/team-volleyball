---
name: volley-save
description: Abschluss- und Speicher-Workflow für die Team-Volleyball-App. Verwenden, wenn ein Arbeitsstand geprüft und gesichert werden soll – Diff-Kontrolle, Typecheck, Lint, volley-reviewer, und nur auf ausdrücklichen Wunsch des Nutzers committen oder pushen.
---

# volley-save – Arbeitsstand prüfen und sauber sichern

Dieser Workflow schließt ein Arbeitspaket ab: prüfen, reviewen und – nur auf ausdrücklichen Wunsch – committen.

## Workflow

1. **Status anzeigen**: `git status --short` und aktuellen Branch (`git branch --show-current`) ausgeben.
2. **Diff kontrollieren**: `git diff` (und `git diff --staged`) auf unerwartete Dateien prüfen – gehört jede geänderte Datei zum aktuellen Arbeitspaket? Unerwartete Dateien dem Nutzer melden.
3. **Prüfungen ausführen**: passende vorhandene Prüfungen laufen lassen – Typecheck `npx tsc --noEmit`, Lint `npm run lint`, Tests nur falls ein Test-Script in `package.json` existiert.
4. **Review**: Subagent `volley-reviewer` auf den tatsächlichen Diff anwenden.
5. **Bei Fehlern nicht speichern**: Wenn Prüfungen fehlschlagen oder der Reviewer BLOCKER/IMPORTANT meldet, nicht committen, sondern Ursache und Findings berichten.
6. **Bei grünem Zustand**: geänderte Dateien auflisten und eine sinnvolle, präzise Commit-Nachricht vorschlagen (englisch, Imperativ, wie die bisherige Historie: "Add team events and attendance responses").
7. **Committen nur auf ausdrücklichen Wunsch**: Nur committen, wenn der Nutzer in seiner **aktuellen** Nachricht ausdrücklich das Speichern bzw. Committen verlangt. Ein früherer Auftrag genügt nicht. Sonst bei Schritt 6 enden.
8. **Pushen nur auf ausdrücklichen Wunsch**: Nur pushen, wenn der Nutzer ausdrücklich Push verlangt.
9. **Nach dem Commit**: erneut `git status` ausführen und prüfen, dass nichts Unerwartetes zurückbleibt.
10. **Bericht**: Commit-Hash (`git rev-parse --short HEAD`) und finalen Status berichten.

## Niemals verwenden

- `git reset --hard`
- `git clean -fd`
- Force Push in jeder Form (`--force`, `--force-with-lease`)
- Löschen nicht reproduzierbarer Dateien
- Überschreiben oder Verwerfen fremder uncommitteter Änderungen

## Weitere Regeln

- Beim Stagen gezielt Dateien angeben (`git add <datei> ...`), nicht pauschal `git add -A`, wenn unerwartete Dateien im Status stehen.
- Keine Secrets committen: vor dem Commit sicherstellen, dass keine `.env`-Datei und keine Schlüssel im Diff enthalten sind.
- Keine Hooks umgehen (kein `--no-verify`).
