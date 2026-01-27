import logging       from "logging";
import datenbank     from "./datenbank.js";
import { Fluglinie } from "./fluglinie.js";

const logger = logging.default( "controller" );

const API_PREFIX = "/api/v1";
const ENTITY_TYP = "fluglinie";


/**
 * Routen für die einzelnen REST-Endpunkte registrieren.
 *
 * @param app Express-Objekt
 */
export default function routenRegistrieren( app ) {

    const prefixFuerRouten = `${API_PREFIX}/${ENTITY_TYP}`;

    const routeRessource  = `${prefixFuerRouten}/:iataCode`;
    const routeCollection = `${prefixFuerRouten}/`;

    app.get( routeCollection, getCollection );
    logger.info( `Route registriert für Collection: GET ${routeCollection}` );

    app.post( routeCollection, postCollection );
    logger.info( `Route registriert für Collection: POST ${routeCollection}` );

    app.get( routeRessource, getResource );
    logger.info( `Route registriert für Entity: GET ${routeRessource}` );

    app.put( routeRessource, putResource );
    logger.info( `Route registriert für Entity: PUT ${routeRessource}` );

    app.patch( routeRessource, patchResource );
    logger.info( `Route registriert für Entity: PATCH ${routeRessource}` );

    app.delete( routeRessource, deleteResource );
    logger.info( `Route registriert für Entity: DELETE ${routeRessource}` );
}


/**
 * REST-Endpunkt für HTTP-GET für Ressource.
 */
async function getResource( req, res ) {

    let iataCode = req.params.iataCode;
    iataCode = iataCode.toUpperCase();

    const ergebnisObjektPromise = datenbank.readFluglinie( iataCode );

    const ergebnisObjekt = await ergebnisObjektPromise;

    if ( ergebnisObjekt ) {

        const nachricht = `Fluglinie mit IATA-Code "${iataCode}" gefunden.`;
        logger.info( nachricht );
        ergebnisObjekt.nachricht = nachricht;

        res.status( 200 )
           .json( ergebnisObjekt );

    } else {

        const nachricht = `Keine Fluglinie mit IATA-Code "${iataCode}" gefunden.`;
        logger.info( nachricht );

        res.status( 404 )
           .json( { nachricht: nachricht } );
    }
}


/**
 * REST-Endpunkt für HTTP-GET auf Collection.
 */
function getCollection( req, res ) {

    const suchString = req.query.q;

    const ergebnisArray = datenbank.searchFluglinie( suchString );

    const anzahl = ergebnisArray.length
    logger.info( `Datensätze aus Collection zurückgeliefert: ${anzahl}` );

    res.setHeader( "X-ANZAHL", anzahl )
       .status( 200 )
       .json( ergebnisArray );
}


/**
 * REST-Endpunkt für HTTP-POST auf Collection.
 */
function postCollection( req, res ) {

    let { iataCode, name, land } = req.body;

    if ( !iataCode || !name || !land ) {

        const nachricht = "Versuch, Fluglinie mit unvollständigen Attribute anzulegen.";
        logger.warn( nachricht );

        res.status( 400 )
           .json({ nachricht: nachricht });

    } else {

        iataCode = iataCode.trim().toUpperCase();
        name     = name.trim();
        land     = land.trim();

        const neueFluglinie = new Fluglinie( iataCode, name, land );

        const erfolg = datenbank.createFluglinie( neueFluglinie );
        if ( erfolg ) {

            const nachricht = `Neue Fluglinie angelegt: ${neueFluglinie}`;
            logger.info( nachricht );

            neueFluglinie.nachricht = nachricht;

            res.status( 201 ) // Created
               .json( neueFluglinie );

        } else {

            const nachricht = `Versuch Fluglinie für bereits vorhandenen IATA-Code "${iataCode}" anzulegen.`;
            logger.warn( nachricht );

            res.status( 409 ) // Conflict
               .json({ nachricht: nachricht });
        }
    }
}


/**
 * REST-Endpunkt für HTTP-PATCH auf Ressource (einzelne Attribute ersetzen).
 */
function patchResource( req, res ) {

    let iataCode = req.params.iataCode;
    iataCode = iataCode.toUpperCase();

    const ergebnisObjekt = datenbank.readFluglinie( iataCode );
    if ( ergebnisObjekt ) {

        let attributGeaendert = false;
        if ( req.body.name ) {

            ergebnisObjekt.name = req.body.name;
            attributGeaendert = true;
        }
        if ( req.body.land ) {

            ergebnisObjekt.land = req.body.land;
            attributGeaendert = true;
        }
        if ( attributGeaendert === false ) {

            const nachricht = `Für Entity mit IATA-Code "${iataCode}" kein Attribut zum Ändern gefunden.`;
            logger.warn( nachricht );

            res.status( 400 ) // Bad Request
               .json({ nachricht : nachricht });
        }

        datenbank.updateFluglinie( ergebnisObjekt );

        const nachricht = `Entity mit IATA-Code "${iataCode}" geändert.`;
        logger.info( nachricht );
        ergebnisObjekt.nachricht = nachricht;

        res.status( 200 )
           .json( ergebnisObjekt );

    } else {

        const nachricht = `Keine Fluglinie mit IATA-Code "${iataCode}" zum Ändern gefunden.`
        logger.warn( nachricht );

        res.status( 404 )
           .json({ nachricht: nachricht });
    }
}


/**
 * REST-Endpunkt für HTTP-PUT auf Ressource (ganze Ressource ersetzen).
 */
function putResource( req, res ) {

    let iataCode = req.params.iataCode;
    iataCode = iataCode.toUpperCase();

    const ergebnisObjekt = datenbank.readFluglinie( iataCode );
    if ( ergebnisObjekt ) {

        let { name, land } = req.body;

        if ( !name || !land ) {

            const nachricht = "Versuch, Fluglinie mit unvollständigen Attribute zu ersetzen.";
            logger.warn( nachricht );

            res.status( 400 )
               .json({ nachricht: nachricht });

        } else {

            ergebnisObjekt.name = name.trim();
            ergebnisObjekt.land = land.trim();

            datenbank.updateFluglinie( ergebnisObjekt );

            const nachricht = `Entity mit IATA-Code "${iataCode}" ersetzt.`;
            ergebnisObjekt.nachricht = nachricht;

            logger.info( nachricht );
            res.status( 200 )
               .json( ergebnisObjekt );
        }

    } else {

        const nachricht = `Keine Fluglinie mit IATA-Code "${iataCode}" zum Ersetzen gefunden.`
        logger.warn( nachricht );

        res.status( 404 )
           .json({ nachricht: nachricht });
    }
}


/**
 * REST-Endput für HTTP-DELETE auf Ressource.
 */
function deleteResource( req, res ) {

    let iataCode = req.params.iataCode;
    iataCode = iataCode.toUpperCase();

    const erfolg = datenbank.deleteFluglinie( iataCode );
    if ( erfolg ) {

        const nachricht = `Fluglinie mit IATA-Code "${iataCode}" gelöscht.`;
        logger.info( nachricht );

        res.status( 200 )
           .json({ nachricht: nachricht });

    } else {

        const nachricht = `Keine Fluglinie mit IATA-Code "${iataCode}" zum Löschen gefunden.`;
        logger.warn( nachricht );

        res.status( 404 )
           .json({ nachricht: nachricht });
    }
}
