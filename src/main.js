import express            from "express";
import logging            from "logging";
import routenRegistrieren from './controller.js';

import { swaggerUiKonfigurieren        } from "./openapi.js";


const PORT_NUMMER = 8080;

const logger = logging.default( "main" );

const app = express();

app.use( express.json() );
app.use( express.static( "public" ) );

routenRegistrieren( app );

swaggerUiKonfigurieren( app );


app.listen( PORT_NUMMER,
    () => { logger.info( `Web-Server auf Port ${PORT_NUMMER} gestartet.` ); }
  );
