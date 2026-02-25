import { open }      from "sqlite";
import sqlite3       from "sqlite3";
import createLogger  from "logging";
import { Fluglinie } from './fluglinie.js';

const logger = createLogger( "datenbank" );


const db = await open({ filename: "iatacodes.db", driver: sqlite3.Database });

const checkTabelleErgebnis = await db.get(
    `SELECT name FROM sqlite_master
            WHERE type='table' AND name="fluglinien"`,
);
if ( checkTabelleErgebnis ) {

    logger.info( `Tabelle mit IATA-Codes existiert bereits.` );

} else {

    logger.info( `Tabelle mit IATA-Codes noch nicht da, wird neu erzeugt ...` );

    await db.exec(
        `CREATE TABLE fluglinien (
            iata_code TEXT PRIMARY KEY,
            name      TEXT,
            land      TEXT )`
        );

    // gleich einige Demo-Daten einfügen
    await db.exec(
        `INSERT INTO fluglinien ( iata_code, name, land ) VALUES
            ( "AA", "American Airlines"  , "USA"         ),
            ( "BA", "British Airways"    , "GB"          ),
            ( "LH", "Lufthansa"          , "Deutschland" ),
            ( "LO", "LOT Polish Airlines", "Polen"       )`
    );

    logger.info( `Tabelle mit IATA-Codes angelegt und mit Demo-Daten befüllt.` );
}

const anzahlZeilen = await db.get( "SELECT count(*) AS anzahl FROM fluglinien" );
logger.info( `Anzahl der Datensätze beim Programmstart: ${anzahlZeilen.anzahl}` );

// Methoden für CRUDS-Operationen: Create, Read, Update, Delete, Search;
// die benötigten Prepared Statements sind vor den jeweiligen Methoden deklariert.

const prepStmtReadFlueglinie = await db.prepare( "SELECT * FROM fluglinien WHERE iata_code = ?" );

/**
 * Fluglinie für gegebenen IATA-Code auslesen.
 *
 * @param {string} iataCode IATA-Code der Fluglinie
 *
 * @return {Fluglinie|null} Fluglinie-Objekt, wenn Fluglinie gefunden wurde,
 *                          ansonsten `undefined`.
 */
async function readFluglinie( iataCode ) {

    await prepStmtReadFlueglinie.bind({ 1: iataCode });
    const ergebnis = await prepStmtReadFlueglinie.get();

    if ( ergebnis ) {

        return new Fluglinie(
            ergebnis.iata_code,
            ergebnis.name,
            ergebnis.land
        );

    } else {

        return null;
    }
}


const prepStmtSearchFlueglinie = await db.prepare( "SELECT * FROM fluglinien WHERE name LIKE ? OR land LIKE ? ORDER BY iata_code ASC" );
const prepStmtAlleFlueglinien  = await db.prepare( "SELECT * FROM fluglinien ORDER BY iata_code ASC" );

/**
 * Suche nach Fluglinien anhand eines Such-Strings oder alle Fluglinien zurückliefern.
 *
 * @param {string} suchString String, der in Name oder Land der Fluglinie enthalten sein soll;
 *                 wenn leerer String "", dann werden alle Fluglinien zurückgeliefert.
 *
 * @returns {Fluglinie[]} Array mit Fluglinien, die den Such-String enthalten, ansonsten leeres Array
 */
async function searchFluglinie( suchString ) {

    let ergebnisArray = null;
    if ( suchString && suchString.trim().length > 0 ) {

        const suchPattern = `%${suchString}%`;
        await prepStmtSearchFlueglinie.bind({ 1: suchPattern, 2: suchPattern });
        ergebnisArray = await prepStmtSearchFlueglinie.all();

    } else {

        ergebnisArray = await prepStmtAlleFlueglinien.all();
    }

    const returnArray = [];
    if ( ergebnisArray && ergebnisArray.length > 0 ) {

        for ( let i = 0; i < ergebnisArray.length; i++ ) {

            const zeile = ergebnisArray[i];
            const fluglinie = new Fluglinie( zeile.iata_code, zeile.name, zeile.land );
            returnArray.push( fluglinie ) ;
        }
    }

    return returnArray;
}


const prepStmtInsertFluglinie = await db.prepare( "INSERT INTO fluglinien ( iata_code, name, land ) VALUES ( ?, ?, ? )" );

/**
 * Neue Fluglinie anlegen.
 *
 * @param {Fluglinie} fluglinie Neu anzulegende Fluglinie
 *
 * @returns {boolean} `true` wenn Fluglinie erfolgreich angelegt wurde,
 *                    `false` wenn bereits eine Fluglinie mit dem IATA-Code existiert.
 */
async function createFluglinie( fluglinie ) {

    try {
        await prepStmtInsertFluglinie.run({ 1: fluglinie.iataCode, 2: fluglinie.name, 3: fluglinie.land });
        return true;
    }
    catch ( fehler ) { // Unique constraint für Eindeutigkeit iata_code verletzt

        logger.error( `Fehler beim Einfügen von Flugline "${fluglinie.iataCode}" -- schon vorhanden? ` + fehler );
        return false;
    }
}


const prepStmtDeleteFluglinie  = await db.prepare( "DELETE FROM fluglinien WHERE IATA_CODE = ?" );

/**
 * Fluglinie für bestimmten IATA-Code löschen.
 *
 * @param {string} iataCode IATA-Code der Fluglinie
 *
 * @return {boolean} `true` wenn Fluglinie erfolgreich gelöscht wurde,
 *                   `false` wenn Fluglinie nicht existierte und deshalb nicht
 *                   gelöscht werden konnte.
 */
async function deleteFluglinie( iataCode ) {

    const ergebnis = await prepStmtDeleteFluglinie.run({ 1: iataCode });

    return ergebnis.changes > 0;
}


const prepStmtUpdateName = await db.prepare( "UPDATE fluglinien SET name = ? WHERE iata_code = ?" );

/**
 * Name von Fluglinie ändern.
 *
 * @param {string} iataCode IATA-Code der Fluglinie
 *
 * @param {string} nameNeu Neuer Name der Fluglinie
 *
 * @returns {boolean} `true` gdw. wenn Name der Fluglinie aktualisiert werden konnte
 */
async function updateName( iataCode, nameNeu ) {

    const ergebnis = await prepStmtUpdateName.run({ 1: nameNeu, 2: iataCode });

    return ergebnis.changes > 0;
}


const prepStmtUpdateLand = await db.prepare( "UPDATE fluglinien SET land = ? WHERE iata_code = ?" );

/**
 * Land von Fluglinie ändern.
 *
 * @param {string} iataCode IATA-Code der Fluglinie
 *
 * @param {string} landNeu Neues Land für Fluglinie
 *
 * @returns {boolean} `true` gdw. wenn Name der Fluglinie aktualisiert werden konnte
 */
async function updateLand( iataCode, landNeu ) {

    const ergebnis = await prepStmtUpdateLand.run({ 1: landNeu, 2: iataCode });

    return ergebnis.changes > 0;
}


const prepStmtUpdateFluglinie = await db.prepare( "UPDATE fluglinien SET name = ?, land = ? WHERE iata_code = ?" );

/**
 * Fluglinie (Ganzer Datensatz) für bestimmten IATA-Code ersetzen.
 *
 * @param {Fluglinie} Fluglinien-Objekt mit neuen Daten
 *                    (alle Attribute inkl. IATA-Code müssen gesetzt sein).
 *
 * @return {boolean} `true` wenn Fluglinie ersetzt werden konnte,
 *                   `false` wenn Fluglinie nicht existiert.
 */
async function updateFluglinie( fluglinie ) {

    const ergebnis = await prepStmtUpdateFluglinie.run({ 1: fluglinie.name, 2: fluglinie.land, 3: fluglinie.iataCode });

    return ergebnis.changes > 0;
}


/**
 * Alle Funktionen als Default-Objekt exportieren.
 */
export default {

    // Lese-Operationen
    readFluglinie,
    searchFluglinie,

    // Schreib-Operationen
    createFluglinie,
    deleteFluglinie,
    updateFluglinie,
    updateLand,
    updateName
};
