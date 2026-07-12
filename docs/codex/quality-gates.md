# Codex Quality Gates

## Vor jedem Arbeitsblock

```powershell
git branch --show-current
git status
git log -5 --oneline --decorate
```

## Technische Mindestprüfungen vor Commitbereitschaft

Nur wenn für den geänderten Bereich relevant:

```powershell
npx tsc --noEmit
npm.cmd run lint
git diff --check
git diff --stat
git status --short
```

Zusätzlich bei Bedarf:

```powershell
git diff --name-only
git diff
git log
git show
```

## Testehrlichkeit

- Nur tatsächlich ausgeführte Tests berichten.
- Exakten Befehl nennen.
- Exit-Code nennen, soweit verfügbar.
- Fehlerausgabe korrekt zusammenfassen.
- Bestehende Fehler von neuen Fehlern trennen.
- Kein Build als erfolgreich bezeichnen, wenn er nicht ausgeführt wurde.

## Git

- Keine direkten Feature-Commits auf `master`.
- Kein Commit ohne ausdrücklichen aktuellen Auftrag.
- Kein Push ohne ausdrücklichen aktuellen Auftrag.
- Kein Merge ohne ausdrücklichen aktuellen Auftrag.
- Kein Tag ohne ausdrücklichen aktuellen Auftrag.
- Kein `reset --hard`.
- Kein `clean -fd`.
- Kein Force Push.

## Supabase

Klar unterscheiden:

- lokale Migration erstellt
- Migration committed
- Migration gepusht
- Migration remote ausgeführt
- Migration remote getestet

Keine Remote-Ausführung ohne ausdrückliche Freigabe.

Vor Remote-Migration:

1. SQL vollständig prüfen
2. Bestand read-only prüfen
3. Risiken erklären
4. erwartetes Ergebnis definieren
5. Wiederherstellungsstrategie bedenken
6. ausdrückliche Freigabe einholen

## Frontend

Bei relevanten UI-Arbeiten prüfen:

- Light Mode
- Dark Mode
- kleine iPhones
- Safe Areas
- Tastatur
- Scrollen
- lange Namen und Texte
- Loading
- Empty
- Error
- Partial Data
- Disabled
- Accessibility
- Touch-Flächen
- Dynamic Type

Ohne reale visuelle Belege:

`VISUELLE PRÜFUNG NICHT AUSGEFÜHRT`

Ohne ausreichende Gerätebelege:

`DEVICE-QA NICHT VOLLSTÄNDIG AUSGEFÜHRT`

## Abschlussstatus

Jeder vollständige Auftrag endet mit genau einer Einschätzung:

- ABGESCHLOSSEN UND COMMITBEREIT
- NICHT ABGESCHLOSSEN
- BLOCKIERT

Ein Abschlussbericht enthält mindestens:

1. Ziel
2. Ausgangszustand
3. Skill
4. eingesetzte Agents
5. Plan oder Diagnose
6. Änderungen
7. geänderte Dateien
8. Tests und echte Ergebnisse
9. Review-Findings
10. reparierte Findings
11. offene Probleme
12. Git-Status
13. Abschlusseinschätzung
