# Codex Workflows

Diese Datei dokumentiert Skills, die erst in einem späteren Paket technisch als `SKILL.md` unter `.agents/skills/` angelegt werden. Ein Skill ist ein Workflow, keine Erlaubnis für ungefragte Aktionen.

## $volley-fix

Für bestehende Fehler.

Typische Folge:

1. `volley-explorer`
2. passender Implementer
3. `volley-tester`
4. `volley-reviewer`
5. Findings reparieren
6. Tests und Review wiederholen

## $volley-feature

Für neue Produktfunktionen.

Typische Folge:

1. `volley-product-guardian`
2. `volley-explorer`
3. Akzeptanzkriterien und Nicht-Ziele
4. passender Implementer
5. `volley-tester`
6. `volley-reviewer`
7. Findings reparieren
8. Tests und Review wiederholen

Bei Supabase-Relevanz zusätzlich gezielt:

- `volley-supabase-specialist`
- `volley-security-reviewer`
- gegebenenfalls `volley-migration-reviewer`
- `volley-regression-reviewer`

## $volley-save

Für Abschluss und Speicherung.

Folge:

1. Git-Status und Diff
2. `volley-tester`
3. `volley-reviewer`
4. relevante Spezialreviews
5. nur bei grünem Zustand commitbereit
6. Commit nur bei ausdrücklichem Auftrag
7. Push nur bei ausdrücklichem Auftrag

## $volley-ui

Für größere UI-Arbeiten oder komplette Flows.

Typische Auswahl, nicht automatisch alle:

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

## $volley-screen

Für genau einen Screen oder eine größere Komponente.

- angrenzende Screens nur bei technischer Notwendigkeit ändern
- bestehendes Verhalten erhalten
- reale Zustände berücksichtigen
- `volley-component-architect` nur bei echter Architekturfrage

## $volley-polish

Für eine bereits funktionierende Oberfläche.

Erlaubt:

- Hierarchie
- Typografie
- Spacing
- Zustände
- Design-System-Konsistenz
- Accessibility
- kleine Displays
- Light und Dark Mode

Nicht erlaubt:

- neue Produktfunktion
- neuer Datenfluss
- neue Navigation
- neues Datenmodell
- vollständige Neugestaltung ohne belegbaren Nutzen

## $volley-design-audit

Vollständig read-only.

Prüft:

- visuelle Konsistenz
- Komponenten
- Zustände
- Accessibility
- Device-QA
- keine App-Datei ändern

## $volley-release

Für Veröffentlichungsvorbereitung.

Typische Folge:

1. `volley-release-manager`
2. `volley-tester`
3. `volley-reviewer`
4. `volley-regression-reviewer`
5. Security-, Migration-, Native- oder Dependency-Review nur bei Relevanz

Keine Builds, Commits, Pushes, Merges oder Tags ohne ausdrücklichen Auftrag.

## Auswahlregeln

- Nicht alle Agents blind starten.
- Nur fachlich relevante Agents verwenden.
- Höchstens ein Schreibagent gleichzeitig.
- Mehrere read-only Agents nur bei unabhängigen Prüfungen parallel.
- Ein Spezialagent ersetzt nicht den allgemeinen Reviewer.
- Ein Skill ist ein Workflow, keine Erlaubnis für ungefragte Aktionen.
