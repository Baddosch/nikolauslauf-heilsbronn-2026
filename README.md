# Nikolauslauf Heilsbronn 2026 – Teilnehmer und Ergebnisse

Statische Seiten für die Teilnehmerübersicht und die Ergebnisse des Nikolauslaufs 2026. Die Veröffentlichung ist über GitHub Pages vorgesehen.

## Seiten

- `index.html` – Einstieg und Links zu Teilnehmern und Ergebnissen
- `teilnehmer/index.html` – öffentliche Teilnehmerübersicht
- `ergebnisse/index.html` – Ergebnisübersicht

## Datenanbindung

Die Seiten erwarten einen öffentlichen, **nur lesenden** Google-Apps-Script-Endpunkt, der ausschließlich freigegebene Felder zurückgibt. Die Konfiguration liegt in `config.js`. Dort wird die URL eingetragen, sobald das Nikolauslauf-Sheet und die passende Web-App bereit sind.

Unterstützte Aktionen:

- `?action=getTeilnehmer` liefert ein Objekt mit den folgenden Rennschlüsseln und Teilnehmerlisten als Werte: `Minis`, `U8`, `U10`, `U12`, `U14`, `U16`, `U18m`, `Maenner`, `U18w`, `Damen`. Ein Teilnehmer kann `name`, `geschlecht` und `team` enthalten.
- `?action=getErgebnisse` liefert ein Objekt mit Rennen als Schlüssel. Je Rennen enthält `categories` Gruppen mit `ageGroup`, `gender` und `results` (Ergebniszeilen als Objekte). Auf der öffentlichen Seite werden ausschließlich `Platz`, `Name`, `Zeit` und `Team/Verein` angezeigt, sofern die Felder vorhanden sind.

Die konkrete Antwortstruktur und die Zuordnung der Rennen müssen mit dem Nikolauslauf-Sheet und dessen Apps Script abgeglichen werden. Die Stadtlauf-URL wird absichtlich nicht verwendet.

**Datenschutz:** Nie das Anmelde-Sheet oder eine beschreibbare Zeitnahme-Web-App direkt als öffentliche Datenquelle verwenden. Der Lese-Endpunkt darf nur zur Veröffentlichung freigegebene Namen/Anzeigenamen, Vereine und Ergebnisdaten ausgeben. E-Mail-Adressen, Geburtsdaten, Zahlungsstatus und andere nicht öffentliche Formularfelder gehören nicht in die Antwort.

## Lokal testen

`config.js` mit der freigegebenen API-URL konfigurieren und die Dateien über einen lokalen Webserver öffnen, zum Beispiel:

```sh
python3 -m http.server 8000
```

Dann `http://localhost:8000` aufrufen. Die Seiten zeigen bis zur Konfiguration einen Hinweis an und verwenden keinen Fallback auf die Stadtlauf-Daten.

## GitHub Pages

Nach dem Push unter **Settings → Pages** den Branch `main` und den Ordner `/ (root)` als Quelle auswählen. Erst nach Einrichtung und Prüfung des öffentlichen Lese-Endpunkts die URLs in `config.js` eintragen und veröffentlichen.
