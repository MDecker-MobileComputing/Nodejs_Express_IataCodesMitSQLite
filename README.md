# REST-API für Fluglinien (Variante mit SQLite) #

<br>

Dieses Repository enthält eine Nodejs-Implementierung einer einfachen REST-API, mit der Informationen zu
Fluglinien anhand der [IATA-Codes](https://de.wikipedia.org/wiki/Liste_der_IATA-Airline-Codes) abgefragt
werden können. Für die Persistenz wird [sqlite3](https://www.npmjs.com/package/sqlite) verwendet.

<br>

| Beschreibung             | **URL-Pfad**                  | `GET` | `POST` | `PUT` | `PATCH` | `DELETE` |
| -----------------------  | ----------------------------- | ----- | ------ | ----- | ------- | -------- |
| Ressource  "Fluglinie"   | `/api/v1/fluglinie/:iataCode` | X     |        | X     | X       | X        |
| Collection "Fluglinie"   | `/api/v1/fluglinie`           | X     | X      |       |         |          |
| Ressource  "Flughafen"   | ...                           |       |        |       |         |          |

<br>

Die Operation `GET` auf den Collections beinhaltet auch die Volltextsuche mit URL-Parameter `q` (für "query"), z.B.:
* `api/v1/fluglinie?=hansa`
* `api/v1/fluglinie?=deutschland`

<br>

Beispiel für eine Entity im JSON-Format:
```
{
    "iataCode": "LH",
    "name"    : "Lufthansa",
    "land"    : "Deutschland"
}
```

<br>

----

## License ##

<br>

See the [LICENSE file](LICENSE.md) for license rights and limitations (BSD 3-Clause License)
for the files in this repository.

<br>
