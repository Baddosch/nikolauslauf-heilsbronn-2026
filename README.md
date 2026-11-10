# Nikolauslauf Heilsbronn 2026 – Teilnehmer und Ergebnisse

Statische Seiten für die Teilnehmerübersicht und die Ergebnisse des Nikolauslaufs 2026. Die Veröffentlichung ist über GitHub Pages vorgesehen.

## Seiten

- `index.html` – Einstieg und Links zu Teilnehmern und Ergebnissen
- `teilnehmer/index.html` – öffentliche Teilnehmerübersicht
- `ergebnisse/index.html` – Ergebnisübersicht

Teilnehmer- und Ergebnisseite sind eigenständige Ansichten ohne Navigationslinks, auch nicht untereinander. Die Teilnehmerseite verwendet eine zusammenhängende Rennleiste mit unterstrichenem aktivem Reiter analog zum Stadtlauf; auf schmalen Bildschirmen darf die Leiste umbrechen.

Jeder Startlauf hat maximal 80 Plätze. Die Teilnehmerseite zeigt je Rennen die veröffentlichten (bezahlten) Anmeldungen als Anzahl und Füllbalken an. Zusammen gestartete Altersklassen teilen sich diese 80 Plätze. Der Balken endet bei 100 Prozent; die tatsächliche Anzahl bleibt auch bei Überschreitung sichtbar. Dies ist eine Anzeige, keine technische Anmeldebegrenzung.

## Datenanbindung

Die Seiten erwarten einen öffentlichen, **nur lesenden** Google-Apps-Script-Endpunkt, der ausschließlich freigegebene Felder zurückgibt. Die Konfiguration liegt in `config.js`. Dort wird die URL eingetragen, sobald das Nikolauslauf-Sheet und die passende Web-App bereit sind.

Unterstützte Aktionen:

- `?action=getTeilnehmer` liefert ein Objekt mit den Rennschlüsseln `Minis`, `U8`, `U10`, `U12`, `U14U16`, `Maenner` und `Damen`. Jeder Teilnehmende enthält nur `name`, `geschlecht`, `team`, `altersklasse` und `rennen`.
- `?action=getErgebnisse` liefert ein Objekt mit Rennen als Schlüssel. Je Rennen enthält `categories` Gruppen mit `ageGroup`, `gender` und `results` (Ergebniszeilen als Objekte). Ergebnisfelder sind `Platz`, `Name`, `Verein/Team`, `Zeit` und `Stadtmeister-Platz`.

Die Teilnehmerantwort gruppiert nach tatsächlichem Startlauf (`Minis`, `U8`, `U10`, `U12`, `U14U16`, `Maenner`, `Damen`). Jeder Teilnehmer enthält nur `name`, `geschlecht`, `team`, `altersklasse` und `rennen`; konkrete Geburtsjahre stehen weder in den Seitenlabels noch in der API-Antwort.

**Datenschutz:** Nie das Anmelde-Sheet oder eine beschreibbare Zeitnahme-Web-App direkt als öffentliche Datenquelle verwenden. Nur das separate, schreibgeschützte Apps Script aus dem Repository `Baddosch/Zeitnahme`, Branch `Nikolauslauf`, Datei `Backend/publicApi.js` ist für die öffentlichen Seiten vorgesehen. Es gibt ausschließlich freigegebene Namens-, Team-, Altersklassen- und Ergebnisfelder aus. E-Mail-Adressen, Geburtsdaten, Jahrgänge, PLZ, Startnummern und Zahlungsstatus gehören nicht in die öffentliche Antwort. Die Stadtmeisterwertung wird im privaten Zeitnahme-Apps-Script anhand der PLZ berechnet; öffentlich erscheint nur der Stadtmeister-Platz.

## Lokal testen

`config.js` mit der freigegebenen API-URL konfigurieren und die Dateien über einen lokalen Webserver öffnen, zum Beispiel:

```sh
python3 -m http.server 8000
```

Dann `http://localhost:8000` aufrufen. Die Seiten zeigen bis zur Konfiguration einen Hinweis an und verwenden keinen Fallback auf die Stadtlauf-Daten.

## GitHub Pages

Nach dem Push unter **Settings → Pages** den Branch `main` und den Ordner `/ (root)` als Quelle auswählen. Erst nach Einrichtung und Prüfung des öffentlichen Lese-Endpunkts die URLs in `config.js` eintragen und veröffentlichen.
