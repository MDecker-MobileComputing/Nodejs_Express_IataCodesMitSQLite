
/**
 * Ein Objekt dieser Klasse enthält Details zu einer Fluglinie.
 */
export class Fluglinie {

    /**
     * Konstruktor, um eine neue Fluglinie zu erstellen.
     *
     * @param {string} IATA-Code einer Fluglinie, z.B. "LH"
     *
     * @param {string} name Name der Fluglinie, z.B. "Lufthansa"
     *
     * @param {string} land Heimatland der Fluglinie, z.B. "Deutschland"
     */
    constructor( iataCode, name, land ) {

        this.iataCode = iataCode;
        this.name     = name;
        this.land     = land;
    }


    /**
     * Volltextsuche in Datensatz.
     *
     * @param {string} suchstring
     *
     * @returns {boolean} `true` gdw. `suchstring` im Namen oder Land der Fluglinie
     *                    enthalten ist
     */
    enthaelt( suchstring ) {

        const suchstringNormalisiert = suchstring.toLowerCase().trim();

        return this.name.toLowerCase().includes( suchstringNormalisiert ) ||
               this.land.toLowerCase().includes( suchstringNormalisiert );
    }


    /**
     * Gibt eine String-Repräsentation des Fluglinie-Objekts zurück.
     *
     * @returns {string} String-Repräsentation des Fluglinie-Objekts
     *          Beispiel:
     *          `Fluglinie { IATA-Code: KL, Name: KLM Royal Dutch Airlines, Land: Niederlande }`
     */
    toString() {

        return `Fluglinie { IATA-Code: ${this.iataCode}, Name: ${this.name}, Land: ${this.land} }`;
    }


    /**
     * Erstellt eine Kopie des aktuellen Fluglinie-Objekts.
     *
     * @returns {Fluglinie} Eine neue Instanz der Fluglinie-Klasse mit
     *                      den gleichen Attributen wie das aufrufende
     *                      Objekt.
     */
    clone() {

        return new Fluglinie(this.iataCode, this.name, this.land);
    }
}