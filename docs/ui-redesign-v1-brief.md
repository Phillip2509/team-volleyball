# Team Volleyball: UI Redesign V1

Status: verbindliche Gestaltungs- und Interaktionsgrundlage fuer UI Redesign V1. Abweichungen in spaeteren Paketen brauchen eine ausdrueckliche Produktentscheidung.

## Produktidee

Die App wird geoeffnet und der Nutzer versteht sofort:

- wo er sich befindet,
- welche Termine in der aktuellen lokalen Kalenderwoche anstehen,
- wie sein eigener Rueckmeldestatus ist und
- welche direkte Aktion moeglich ist.

Die Oberflaeche ist eine ruhige, mobile Team-App und kein Dashboard. Fachliche Klarheit, schnelle Rueckmeldung und belastbare Zustaende haben Vorrang vor Dekoration.

## Visuelle Richtung

- professionell, ruhig, hochwertig und modern
- leicht sportlich durch klare Typografie, kompakte Terminmetadaten und praezise Statusfarben
- mobile-first und iOS-orientiert, ohne Android oder Web zu brechen
- Light und Dark Mode gleichwertig
- Cyan nur gezielt fuer aktive Navigation, Fokus, Auswahl und Hauptaktionen
- flache Surfaces mit Kontur
- normale Cards ohne dominanten Standardschatten
- Systemschrift; keine neue Font-Dependency
- pro Ansicht hoechstens eine dominante Primaeraktion

Die Referenzidee uebernimmt nur die Prinzipien Begruessung, kompakte Wochenuebersicht, klar strukturierte Terminkarten, sichtbarer Rueckmeldestatus und ruhige mobile Navigation. Keine fremde App wird 1:1 kopiert.

## Verbotene Muster und Nichtziele

Verboten sind:

- Card-in-Card-in-Card
- riesige Ueberschriften ohne funktionalen Grund
- mehrere gleich dominante Primaerbuttons
- jede Information in einer eigenen grossen Card
- uebermaessige Pill-Buttons
- zufaellige Radien, Abstaende oder Farben
- starke Gradients und Glassmorphism
- kuenstliche Dashboard-Statistikflaechen
- Marketing-, Fitness-Template-, generischer KI- oder Vibe-Code-Look
- abgeschnittene Texte
- gequetschte zweispaltige Formfelder
- Fake-Funktionalitaet, Fake-Nachrichten oder dynamisch erfundene Demo-Termine

Nicht Teil von Paket 1 sind:

- Redesign des vollstaendigen Termine-Tabs
- Redesign des Termin-Erstellen-/Bearbeiten-Modals
- Redesign von Team, Nachrichten, Settings oder Auth
- neue Navigation, Chats oder Produktfunktionen
- Aenderungen an Supabase, Datenmodell, RPCs, Migrationen oder RLS
- Aenderungen der Auth-, Rollen-, Termin- oder RSVP-Fachlogik
- neue Dependencies
- eine dynamische globale Themefarbe aus der Team-Akzentfarbe

## Design-Foundations

Neue Komponenten verwenden die additiven Foundations. Bestehende Theme-Keys und nicht migrierte Screens bleiben unveraendert, um globale Regressionen zu vermeiden.

### Spacing

| Token | Wert |
| --- | ---: |
| 1 | 4 |
| 2 | 8 |
| 3 | 12 |
| 4 | 16 |
| 5 | 20 |
| 6 | 24 |
| 7 | 32 |
| 8 | 40 |

Verwendung:

- Screen-Padding: 16, auf groesseren Phones maximal 20
- Card-Padding: 14 bis 16
- Abstand zwischen EventCards: 12
- Section-Abstand: 24, grosse Uebergaenge 32
- innerhalb von Cards: 8 bis 12

### Radien, Konturen und Schatten

| Rolle | Radius |
| --- | ---: |
| kleine Elemente | 8 |
| Controls und Cards | 12 |
| Modal und Sheet | 16 |
| echte Badges und runde Icon-Buttons | full |

- Controls und Surfaces erhalten eine 1-Punkt-Kontur.
- Hairlines sind Listentrennern vorbehalten.
- Normale Cards erhalten keinen dominanten Schatten.
- Modal und Sheet duerfen genau eine zurueckhaltende Elevationsebene verwenden.

### Groessen

- Touchflaechen mindestens 44 x 44 Punkte
- Inputs mindestens 48 Punkte hoch
- Inline-Icons 16, Metadaten und Controls 20, Navigation 24

### Typografie

| Rolle | Groesse / Zeilenhoehe | Gewicht |
| --- | --- | --- |
| Greeting | 28 / 34 | 700 |
| Section | 20 / 26 | 700 |
| Card-Titel | 17 / 22 | 700 |
| Body | 15 / 21 | 400 |
| Label | 14 / 19 | 600 |
| Caption / Badge | 12 / 16 | 600 bis 700 |

Gewicht 900 bleibt Ausnahmefaellen vorbehalten. Datum und Uhrzeit verwenden nach Moeglichkeit tabular-nums. Dynamic Type wird nicht deaktiviert.

### Farben

| Rolle | Light | Dark |
| --- | --- | --- |
| Canvas | `#F6F8FB` | `#0B1220` |
| Surface | `#FFFFFF` | `#121C2E` |
| Surface subtle / Input | `#F1F5F9` | `#17243A` |
| Text | `#0F172A` | `#F8FAFC` |
| Muted text | `#5B6B80` | `#A5B4C7` |
| Border | `#DCE3ED` | `#2B3A52` |
| Accent | `#047E9B` | `#27B9D2` |
| Accent pressed | `#03677F` | `#1AA0B6` |
| Accent soft | `#DDF7FC` | `#123947` |
| Success | `#0F6F4D` | `#62D49F` |
| Warning | `#89520D` | `#F0B653` |
| Danger | `#A93440` | `#F1868F` |

Dark Mode trennt Ebenen ueber Surface und Border, nicht ueber starke Schatten. Statusfarben sind nie alleiniger Informationstraeger. Reale Light-/Dark-Kombinationen werden vor Abschluss erneut auf Kontrast geprueft.

## Startscreen

Verbindlicher Aufbau:

1. kompakter Greeting-Header
2. Section `Diese Woche`
3. kleiner lokaler Datumsbereich, zum Beispiel `13.-19. Juli`
4. ausschliesslich Terminkarten der aktuellen lokalen Kalenderwoche

Der Header zeigt `Hallo, <Name>` und darunter exakt `Das steht diese Woche an.`. Rechts befindet sich ein Hamburger mit mindestens 44 x 44 Punkten und dem Accessibility-Label `Menue oeffnen` beziehungsweise in der UI-Schreibweise `Menü öffnen`.

Die Namensreihenfolge ist:

1. `profile.displayName.trim()`
2. sauberer Wert aus `user_metadata.display_name`, `full_name` oder `name`
3. `Teammitglied`

Eine E-Mail-Adresse wird nie als Greeting verwendet.

Der Startscreen enthaelt keine Statistik-Cards, Demo-Mitteilungen, Schnellaktions-Dashboard-Bloecke oder redundante Navigation zum Termine-Tab. Demo und Echt verwenden denselben normalisierten `TeamEventWithResponse`-Datenpfad aus dem Event-Context.

### Lokale Kalenderwoche

- Beginn: Montag 00:00 lokale Geraetezeit, inklusive
- Ende: folgender Montag 00:00 lokale Geraetezeit, exklusiv
- Berechnung mit `Date` und `setDate`, nicht ueber UTC-Strings oder feste 7-Tage-Millisekundenaddition
- ungueltige Startzeitpunkte werden ausgeschlossen
- kommende Termine aufsteigend
- danach vergangene Termine derselben Woche, bevorzugt neueste zuerst
- abgesagte Termine bleiben in ihrer Zeitgruppe sichtbar
- kein Termin ausserhalb des Bereichs

`now` und die Wochengrenzen werden beim Mount, beim Fokus des Startscreens, beim Wechsel von `AppState` auf `active` und zeitnah ueber einen nur im Fokus aktiven Timer aktualisiert. Die lokale Neuberechnung loest keinen Backend-Refresh aus.

### Startscreen-Zustaende

- Initial Loading: Greeting plus zwei ruhige Card-Skeletons; kein leerer Zwischenzustand.
- Refresh mit Daten: vorhandene Cards bleiben sichtbar; ein kleiner Indikator zeigt die Aktualisierung.
- Error ohne Daten: `InlineFeedback` mit `Erneut versuchen`, wenn `refreshEvents` verfuegbar ist.
- Error mit Daten: kompakter Hinweis oberhalb der vorhandenen Daten.
- Empty: exakt `Diese Woche steht nichts an.`
- Empty Admin/Coach: zusaetzlich eine sekundaere Aktion `Termin erstellen` nach `/events`.
- Empty Spieler: keine Verwaltungsaktion.
- Ein Termin: normale kompakte Karte, keine Hero-Card.
- Mehrere Termine: vertikale scrollbare Liste mit 12 Punkten Abstand, kein Carousel.
- Vergangen: nach kommenden Terminen, visuell zurueckgenommen, Textstatus `Vorbei`, keine Antwortaktion.
- Abgesagt: sichtbar und zurueckgenommen, Textstatus `Abgesagt`, keine Antwortaktion.

## Haupt- und Sekundaernavigation

Die fuenf Bottom-Tabs bleiben unveraendert:

1. Start
2. Termine
3. Team
4. Nachrichten
5. Einstellungen

Das Hamburger-Menue ist eine erweiterbare sekundaere Navigation und dupliziert nicht die Haupttabs. Paket 1 enthaelt:

- Profil und Account; solange kein separater Unterbereich existiert, als klarer Fallback zum bestehenden Settings-Bereich
- Team wechseln nur bei mehr als einem Team und ueber die bestehende `selectTeam`-Funktion
- Abmelden nur bei realer Session
- im Demo-Modus stattdessen `Demo-Modus verlassen`

Es enthaelt keine Links zu Start, Termine, Team oder Nachrichten und keine erfundenen Verwaltungsaktionen. Das Sheet oeffnet von rechts, respektiert Safe Areas, schliesst ueber X und Android-Back, ist als Modal fuer Assistenztechnologien markiert und gibt den Bedienkontext nach dem Schliessen an den Hamburger zurueck, soweit React Native dies plattformuebergreifend sauber zulaesst. Lokale asynchrone Fehler erscheinen als `InlineFeedback`.

## Badge

`Badge` ist kompakt, typisiert und verwendet Radius 8. Unterstuetzte semantische Tones sind mindestens neutral, accent, success, warning und danger. Das sichtbare Label benennt den Status; ein optionales Symbol ergaenzt ihn. Status wird nie nur ueber Farbe kommuniziert.

Fachliche Labels umfassen unter anderem `Training`, `Spiel`, `Event`, `Abgesagt`, `Vorbei` und `Rückmeldung geschlossen`.

## EventCard

Die gemeinsame Kartenfamilie akzeptiert normalisierte `TeamEventWithResponse`-Daten oder ein explizites ViewModel, aber kein unkontrolliertes Demo-/Echt-Union. Die Startscreen-Variante zeigt immer:

- Terminart
- Titel
- lokalen Wochentag und lokales Datum
- Startzeit und optionale Endzeit
- Ort, falls vorhanden
- eigenen Rueckmeldestatus
- `AttendanceControl`, solange eine Antwort moeglich ist

Sekundaer sichtbar sind eine relevante Rueckmeldefrist und die Textstatus `Vorbei`, `Abgesagt` oder `Rückmeldung geschlossen`.

Nicht dauerhaft sichtbar sind Beschreibung, vollstaendige Teilnehmeruebersicht, Statistik-Cards, Coach-/Admin-Aktionssammlung sowie grosse Bearbeiten-/Absagen-Buttons.

Die Card ist eine flache Surface mit 1-Punkt-Border, Radius 12 und Padding 16. Sie hat keinen normalen Schatten und keine verschachtelte Card. Lange Titel und Orte duerfen umbrechen. Zeitangaben verwenden tabular-nums. Vergangene oder abgesagte Cards bleiben lesbar, wirken aber durch Surface und Textgewicht ruhiger.

## AttendanceControl

Das Control ist rein praesentational und kennt weder Context noch Supabase. Es bietet drei Antworten:

- `Zusagen` mit Symbol
- `Vielleicht` mit Symbol
- `Absagen` mit Symbol

Jedes Ziel ist mindestens 44 Punkte hoch. Auswahl wird durch Text, Symbol und `accessibilityState.selected` vermittelt. Bei fehlender expliziter Antwort ist die effektive Antwort weiterhin `accepted`; sichtbar steht exakt `Standardmäßig zugesagt · noch nicht bestätigt`.

Beim Speichern wird nur das betroffene Control gesperrt und zeigt lokalen Progress. Fehler stehen direkt unter dem Control und erlauben eine erneute Auswahl. Erfolg wird lokal und kompakt bestaetigt. Demo-Termine sind nicht antwortbar.

Vergangene, abgesagte oder geschlossene Termine zeigen keine aktiven Antwortbuttons, aber weiterhin einen verstaendlichen Rueckmeldestatus. Die bestehende Fachlogik wird nicht geaendert.

Fristsemantik:

- mit Frist erst geschlossen, wenn `nowMs > deadline`
- ohne Frist geschlossen, wenn `nowMs >= startsAt`
- vergangene Termine haben immer keine Antwortaktion
- abgesagte Termine haben keine Antwortaktion

## InlineFeedback

`InlineFeedback` unterstuetzt `info`, `success`, `warning` und `error`. Es ist kompakt, nutzt Text plus Symbol, besitzt eine Accessibility-Live-Region und kann optional eine Retry-Aktion anbieten. Es ersetzt grosse Erfolgsmodals nicht durch andere grosse Container.

## Light und Dark Mode

- identische Informationshierarchie
- Cyan im Dark Mode nur als Akzent
- Ebenen durch Canvas, Surface und Border
- kuehles Off-White als Light-Canvas
- Status immer Text plus Symbol
- keine globale Verwendung von Team-Accentfarben in V1

## Accessibility

Verbindlich sind:

- Touchziele mindestens 44 x 44 Punkte
- sinnvolle Rollen, Labels, Hints und Disabled-/Selected-States
- Antwortoptionen enthalten den Terminbezug im Accessibility-Label
- Standard-Zusage und explizite Zusage sind fuer Screenreader unterscheidbar
- Status ist nie nur Farbe
- Fehler verwenden `accessibilityRole="alert"` und eine assertive Live-Region
- Erfolg und Information verwenden eine polite Live-Region
- gesperrte Zustaende bleiben textlich erklaert
- Icon-only-Aktionen haben eindeutige Labels
- Sheet besitzt Modal-Semantik und sinnvolle Fokus-Rueckgabe
- Dynamic Type bleibt aktiv
- lange deutsche Texte duerfen umbrechen

## Verhalten bei 320 Punkten und grosser Schrift

- keine globale horizontale Scrollbarkeit
- Screen-Padding bleibt 16
- Titel, Ort, Teamname und Feedback duerfen mehrzeilig werden
- Antwortziele brechen bei normaler Schrift nicht unruhig in `2 + 1`
- bei starker Fontskalierung stapeln die drei Ziele sinnvoll vertikal
- Cards bleiben ohne verschachtelte Container kompakt
- ungefaehr zwei kompakte Terminkarten mit Rueckmeldung sollen im ersten sichtbaren Bereich eines kleinen iPhones moeglich sein; dies muss real auf einem Geraet oder Simulator geprueft werden
- Safe Areas und Home Indicator bleiben frei

## Zustandsvertrag

| Zustand | Darstellung |
| --- | --- |
| Initial Loading | Greeting und zwei ruhige Skeleton-Cards |
| Refresh | Daten bleiben sichtbar, kleiner Indikator |
| Empty | ein kompakter kontextbezogener Empty State |
| Error ohne Daten | InlineFeedback mit Retry |
| Error mit Daten | kompakter Hinweis ueber den Cards |
| Partial | fehlende optionale Metadaten auslassen |
| Saving | nur betroffenes AttendanceControl sperren; Progress plus Text |
| Success | lokale Live-Bestaetigung |
| Disabled | Grund sichtbar kommunizieren |
| Permission denied | unzulaessige Verwaltungsaktion nicht zeigen |
| Response closed | `Rückmeldung geschlossen` und keine Antwortaktion |
| Cancelled | `Abgesagt` und keine Antwortaktion |
| Past | `Vorbei` und keine Antwortaktion |

## Abnahmeregeln fuer Paket 1

- Der Home-Screen verwendet ausschliesslich `useEvents().events` fuer Demo und Echt.
- Die lokale Montag-bis-Montag-Grenze ist rein und testbar implementiert.
- Kommende Termine stehen vor vergangenen Terminen derselben Woche.
- Abgesagte Termine bleiben sichtbar; ungueltige Starts und Termine ausserhalb der Woche fehlen.
- Greeting verwendet den sicheren Namensfallback ohne E-Mail.
- Hamburger und alle Antwortziele sind mindestens 44 x 44 Punkte gross.
- Admin/Coach sehen die Empty-Aktion; Spieler nicht.
- RSVP nutzt unveraendert `respondToEvent(event.id, response)`.
- Keine Demo-Mitteilungen, Statistiken oder Schnellaktionsbloecke verbleiben auf Home.
- EventCard, AttendanceControl, Badge und InlineFeedback sind Light-/Dark-faehig und zugaenglich.
- Keine Backend-, Dependency-, Tab- oder Fachlogikaenderung wird vorgenommen.

## Spaetere reale QA

Statisch zu pruefen sind Wochenfilter, Rollen, Datenpfad, Fristsemantik, lange Texte, Dynamic Type und 320-Punkte-Layout. Visuell zu pruefen sind Home in Light und Dark, mehrere Termine, Empty State und Menu-Sheet auf kleinem iPhone.

Ohne echte Screenshots gilt: `VISUELLE PRÜFUNG NICHT AUSGEFÜHRT`.

Ohne ausreichende reale Geraetepruefung gilt: `DEVICE-QA NICHT VOLLSTÄNDIG AUSGEFÜHRT`.
