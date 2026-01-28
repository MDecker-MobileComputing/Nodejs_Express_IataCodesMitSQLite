import sqlite3 from "sqlite3";
import { open } from "sqlite";
import logging       from "logging";
import { Fluglinie } from './fluglinie.js';

const logger = logging.default( "datenbank" );


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
            land      TEXT)`
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

const prepStmtReadFlueglinie   = await db.prepare( "SELECT * FROM fluglinien WHERE iata_code = ?" );
const prepStmtSearchFlueglinie = await db.prepare( "SELECT * FROM fluglinien WHERE name LIKE ? OR land LIKE ? ORDER BY iata_code" );
const prepStmtAlleFlueglinien  = await db.prepare( "SELECT * FROM fluglinien ORDER BY iata_code" );


// Methoden für CRUDS-Operationen: Create, Read, Update, Delete, Search


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


/**
 * Suche nach Fluglinien anhand eines Suchstrings oder alle Fluglinien zurückliefern.
 *
 * @param {string} suchString String, der in Name oder Land der Fluglinie enthalten sein soll;
 *                 wenn leerer Strin "", dann werden alle Fluglinien zurückgeliefert.
 *
 * @returns {Fluglinie[]} Array mit Fluglinien, die den Suchstring enthalten, ansonsten leeres Array
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


    let returnArray = [];
    if ( ergebnisArray && ergebnisArray.length > 0 ) {

        for ( let i = 0; i < ergebnisArray.length; i++ ) {

            const zeile = ergebnisArray[i];
            const fluglinie = new Fluglinie( zeile.iata_code, zeile.name, zeile.land );
            returnArray.push( fluglinie ) ;
        }
    }

    return returnArray;
}


/**
 * Neue Fluglinie anlegen.
 *
 * @param {Fluglinie} fluglinie Neu anzulegende Fluglinie
 *
 * @returns {boolean} `true` wenn Fluglinie erfolgreich angelegt wurde,
 *                    `false` wenn Fluglinie bereits existiert.
 */
function createFluglinie( fluglinie ) {

    /*
    const schonDa = readFluglinie( fluglinie.iataCode );
    if ( schonDa ) {

        logger.info( `Fluglinie mit IATA-Code "${fluglinie.iataCode}" existiert bereits: ${schonDa}` );
        return false;
    }

    fluglinienObjekt[ fluglinie.iataCode ] = fluglinie.clone();
    return true;
    */
}


/**
 * Fluglinie für bestimmten IATA-Code löschen.
 *
 * @param {string} iataCode IATA-Code der Fluglinie
 *
 * @return {boolean} `true` wenn Fluglinie erfolgreich gelöscht wurde,
 *                   `false` wenn Fluglinie nicht existiert.
 */
function deleteFluglinie( iataCode ) {

    /*
    const istDa = readFluglinie( iataCode );
    if ( istDa ) {

        delete fluglinienObjekt[ iataCode ];
        return true;

    } else {

        return false;
    }
    */
}


/**
 * Fluglinie für bestimmten IATA-Code ersetzen.
 *
 * @param {Fluglinie} Fluglinien-Objekt mit neuen Daten
 *                    (alle Attribute inkl. IATA-Code müssen gesetzt sein).
 *
 * @return {boolean} `true` wenn Fluglinie ersetzt werden konnte,
 *                   `false` wenn Fluglinie nicht existiert.
 */
function updateFluglinie( fluglinie ) {

    /*
    const objekt = readFluglinie( fluglinie.iataCode );
    if ( objekt ) {

        objekt.name = fluglinie.name;
        objekt.land = fluglinie.land;

        fluglinienObjekt[ fluglinie.iataCode ] = objekt;

        return true;

    } else {

        return false;
    }
    */
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
    updateFluglinie
};
