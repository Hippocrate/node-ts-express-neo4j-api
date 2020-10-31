import config from "./config/env/index";
import { configureExpress, configureErrors } from "./config/express";
import container from "./config/di";
import configureAuth from "./config/authentication";
import configureServices from "./config/services";
import passport = require("passport");
import { MongoDBConnection } from "./utils/connection";
import { InversifyExpressServer } from "inversify-express-utils";
const debug = require("debug")("up-up:index");
import "./controllers";

MongoDBConnection.connect(config.mongodb)
	.then(() => { console.log("DB connected"); })
	.catch(e => { console.error(" DBerror", e); });

// configure OAuth bearer authentication
configureAuth(passport);

// configure services and DI
configureServices(container, passport);

// start the server
let server = new InversifyExpressServer(container);
server.setConfig(configureExpress);

let app = server.build();

// listen on port config.port
app.listen(config.port, () => {
	console.log(`server started on port ${config.port} (${config.env})`);
});

export default app;