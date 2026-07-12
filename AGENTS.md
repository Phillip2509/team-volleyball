# Team Volleyball - Codex Project Instructions

## Projekt

- Projektpfad: `C:\Users\Stein\OneDrive\Desktop\Volleyball-Team-App\team-volleyball`
- Expo SDK 56
- React Native
- TypeScript
- Expo Router
- Supabase Auth
- Supabase PostgreSQL
- Row Level Security
- iOS Development Build
- Light Mode
- Dark Mode

## Verbindlicher Arbeitsmodus

- Immer nur ein klar abgegrenztes Arbeitspaket gleichzeitig.
- Bestehende offene Arbeit vor neuen Produktfeatures abschließen.
- Scope nicht eigenständig vergrößern.
- Keine ungeplanten Nebenfeatures.
- Vor Änderungen tatsächlichen Git-Stand prüfen.
- Höchstens ein schreibender Agent gleichzeitig.
- Read-only Agents dürfen nur bei unabhängigem Nutzen parallel arbeiten.
- Claude und Codex dürfen niemals gleichzeitig dieselben Dateien bearbeiten.
- Agentenergebnisse sind Hinweise und müssen vom Hauptagenten kritisch zusammengeführt werden.
- Spezialreviewer ersetzen nie den finalen allgemeinen Reviewer.

## Runtime-Fallback für nicht verfügbare Custom Agents

1. Einen angeforderten projektbezogenen Custom Agent zunächst genau einmal über seinen Namen starten.
2. Falls die Runtime exakt oder sinngemäß `unknown agent_type` meldet, darf derselbe Start nicht wiederholt werden.
3. Danach die passende Datei `.codex/agents/<agent-name>.toml` lesen.
4. Aus der TOML mindestens berücksichtigen:
   - `name`
   - `description`
   - `sandbox_mode`
   - `developer_instructions`
5. Für einen Agenten mit `sandbox_mode = "read-only"` den eingebauten Agenten `explorer` starten und ihm die rollenbezogenen `developer_instructions` sowie die konkreten read-only Grenzen des aktuellen Auftrags übergeben.
6. Für einen Agenten mit `sandbox_mode = "workspace-write"` den eingebauten Agenten `worker` nur dann starten, wenn der aktuelle Nutzerauftrag ausdrücklich Schreibarbeit erlaubt und die erlaubten Dateien klar festgelegt sind.
7. Ohne ausdrückliche Schreibfreigabe darf ein workspace-write Fallback nicht gestartet werden. In diesem Fall mit BLOCKIERT stoppen.
8. Der eingebaute Agent `default` darf nur verwendet werden, wenn `explorer` oder `worker` fachlich beziehungsweise technisch nicht passen.
9. Der Fallback darf niemals genutzt werden, um:
   - Sandbox-Grenzen zu umgehen
   - zusätzliche Schreibrechte zu erzeugen
   - Dependencies zu installieren
   - Migrationen auszuführen
   - Supabase remote zu verändern
   - Builds zu starten
   - Commits, Pushes, Merges oder Tags auszuführen
10. Im Bericht muss exakt kenntlich gemacht werden:

    `CUSTOM-AGENT-FALLBACK VERWENDET:`
    `<angeforderter Custom Agent> -> <tatsächlich gestarteter Built-in-Agent>`

11. Niemals behaupten, der Custom Agent sei erfolgreich gestartet worden, wenn tatsächlich der Fallback verwendet wurde.
12. Falls die passende TOML fehlt, nicht parsebar ist oder widersprüchliche Anweisungen enthält:
    - keinen Ersatzagenten starten
    - mit BLOCKIERT stoppen
13. Der Hauptagent bleibt für Scope, Zusammenführung und Prüfung der Ergebnisse verantwortlich.

## Verbotene automatische Aktionen

- Keine Dependency ohne ausdrückliche Genehmigung.
- Keine Migration ohne klaren Auftrag.
- Keine Remote-Migration ohne ausdrückliche Freigabe.
- Keine Produktionsdatenbankänderung ohne Auftrag.
- Keine EAS-Builds oder kostenrelevanten Aktionen ohne Auftrag.
- Keine Secrets lesen oder ausgeben.
- Kein Commit ohne ausdrücklichen aktuellen Auftrag.
- Kein Push ohne ausdrücklichen aktuellen Auftrag.
- Kein Merge ohne ausdrücklichen aktuellen Auftrag.
- Kein Tag ohne ausdrücklichen aktuellen Auftrag.
- Keine destruktiven Git-Befehle.
- Keine ungefragten Änderungen an Claude-Konfigurationen.

## Qualität

- Tatsächlich ausgeführte Tests und Annahmen klar trennen.
- Keine erfolgreichen Tests behaupten, die nicht ausgeführt wurden.
- Keine visuelle Prüfung ohne reale visuelle Belege behaupten.
- Keine vollständige Device-QA-Prüfung nur anhand von Quellcode behaupten.
- Supabase-, Rollen-, Team-, RLS- und Berechtigungslogik besonders kritisch behandeln.
- Bestehende Komponenten und Design-Tokens zuerst verwenden.
- Keine generische KI-, SaaS- oder Template-Dashboard-Optik.
- Light Mode, Dark Mode, Safe Areas, Tastatur, Scrollen und kleine Displays berücksichtigen, wenn UI betroffen ist.

## Verbindliche Dokumentation

Vor relevanter Arbeit die passenden Dateien lesen:

- `docs/codex/agent-catalog.md`
- `docs/codex/workflows.md`
- `docs/codex/quality-gates.md`

Die dort beschriebenen Agents und Workflows gezielt einsetzen, niemals pauschal alle Agents starten.
