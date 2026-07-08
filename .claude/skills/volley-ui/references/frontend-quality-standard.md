# Frontend-Qualitätsstandard – Team Volleyball App

Verbindlicher Maßstab für alle Frontend-Arbeiten (`/volley-ui`, `/volley-screen`, `/volley-polish`, `/volley-design-audit` und alle Frontend-Agenten). Die App soll als echtes Produkt veröffentlicht werden – ruhige, moderne, sportliche Optik; Funktionalität und Verständlichkeit vor Effekthascherei.

## Nutzerführung

- Pro Screen **eine klar erkennbare Hauptaufgabe**.
- Die **primäre Aktion ist visuell klar** (bestehendes Muster: `primary-button` mit `colors.primary`).
- **Sekundäre Aktionen zurückhaltend** (secondary-Variante, Textlinks, Menüs) – sie konkurrieren nicht mit der Hauptaktion.
- **Keine unnötigen Entscheidungen**: Wenn die App etwas sinnvoll vorbelegen kann, tut sie es.
- **Verständliche Begriffe** in deutscher Alltagssprache ("Zusagen", "Termin", "Team").
- **Keine technischen Datenbankbegriffe in der UI** (kein "Row", "null", "Membership", keine IDs, keine rohen Fehlercodes).

## Zustände

Jeder datenabhängige Screen berücksichtigt:

- **Initial Loading** – Ladeindikator statt leerem Flackern.
- **Refresh** – erneutes Laden ohne Datenverlust im Bild.
- **Empty** – hochwertiger leerer Zustand (`empty-state`): erklärt, warum leer, und was der Nutzer tun kann.
- **Error** – verständliche deutsche Meldung mit Weg zurück (erneut versuchen), kein roher Fehlertext.
- **Partial Data** – fehlende Einzelfelder (z. B. Name, Antwortstatus) brechen das Layout nicht.
- **Success** – der Normalfall, auch mit vielen Einträgen und langen Texten.
- **Disabled** – sichtbar und begründbar (Muster: `opacity` wie in `primary-button`).
- **Offline** – nur soweit technisch bereits vorgesehen; keine Offline-Logik erfinden.

## Responsive Mobile UI

- **Keine festen Annahmen über Bildschirmhöhe**, keine hardcodierten Bildschirmbreiten – Flex-Layouts.
- **Keine abgeschnittenen Inhalte**: lange deutsche Texte, lange Namen, große Systemschrift.
- **Safe Areas** überall (iPhones mit und ohne Dynamic Island; `screen-container`/`react-native-safe-area-context`).
- **Keyboard**: Eingaben bleiben sichtbar, Tastatur verdeckt keine Aktionen.
- **Kleine Displays**: Layout funktioniert auch auf den kleinsten unterstützten iPhones.
- **Dynamische Inhalte**: 0, 1, viele Einträge – alles sieht beabsichtigt aus.
- **Scrollbarkeit**: Inhalte, die höher als der Viewport sein können, sind scrollbar; lange Listen virtualisiert (`FlatList`/`SectionList`).

## Design-System

- **Bestehende Tokens verwenden**: `spacing`, `radius`, `fontSizes`, `shadows` und `ThemeColors` aus `constants/theme.ts`. Fehlt ein Token, wird die Lücke gemeldet – nicht hart codiert.
- **Semantische Farben**: `danger` für Destruktives, `success` für Positives, `warning` für Offenes, `primary` für die Hauptaktion – nie dekorativ zweckentfremdet.
- **Konsistente Abstände** über `spacing`-Tokens; vergleichbare Elemente haben vergleichbare Abstände.
- **Konsistente Typografie** über `fontSizes`; Gewichte wie im Bestand (800 für Titel/Buttons).
- **Wiederverwendbare Komponenten** aus `components/` zuerst; Erweiterung vor Neuanfertigung.
- **Keine unnötigen Einzelanfertigungen**: kein Screen erfindet eigene Buttons, Cards oder Badges, wenn es sie schon gibt.
- Dark und Light Mode sind gleichwertig – jede Farbe kommt aus dem Theme und funktioniert in beiden Modi.

## Produktqualität

- **Keine Platzhalter im finalen Flow** ("Lorem ipsum", "TODO", Dummy-Bilder).
- **Keine Fake-Funktionalität** und **keine Buttons ohne Wirkung** – was nicht funktioniert, wird nicht angezeigt.
- **Keine dauerhaften Debug-Ausgaben** und **kein Console-Spam** (`console.log` gehört nicht in fertige Screens).
- **Keine unverständlichen Fehlermeldungen** – immer deutsch, konkret, mit nächstem Schritt.
- **Keine zufälligen Animationen** – Bewegung nur für Orientierung, Feedback oder Hierarchie.
- **Keine visuelle Überladung** – keine beliebigen Gradients, kein übertriebenes Glassmorphism, keine riesigen Überschriften ohne Informationswert, kein generisches "KI-SaaS"-Layout.

## Abschlusskriterien

Eine Frontend-Aufgabe ist erst abgeschlossen, wenn:

1. Akzeptanzkriterien erfüllt.
2. Typecheck (`npx tsc --noEmit`) und vorhandene Prüfungen (`npm run lint`) grün.
3. Diff reviewed (`volley-reviewer`, bei UI zusätzlich `volley-design-system-guardian`).
4. Dark und Light Mode berücksichtigt.
5. Lade-, Fehler- und leere Zustände berücksichtigt.
6. Accessibility geprüft (`volley-accessibility-reviewer`).
7. Visuelle Prüfung ausgeführt **oder klar als "VISUELLE PRÜFUNG NICHT AUSGEFÜHRT" dokumentiert**.
8. Keine BLOCKER- oder IMPORTANT-Findings offen.
9. Git-Status berichtet.
10. Strukturierter Abschlussbericht erstellt (Ziel, Screen/Flow, Änderungen, Dateien, Komponenten/Tokens, Zustände, Dark/Light, Displays, Safe Area/Keyboard, Accessibility, Visual-QA, Tests, Findings, offene Probleme, Git-Status, Einschätzung: abgeschlossen und commitbereit / nicht abgeschlossen / blockiert).
