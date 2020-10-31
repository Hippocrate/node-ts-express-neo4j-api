import {Discoverer} from "./discoverer";
import {DbDeployer} from "./deployer";
import winston = require( "winston" );
import config from "../config/env";
import { Neo4jConnection } from "./services";
import logger from "config/winston";

let neo4j = require("neo4j");
let db = new neo4j.GraphDatabase(config.neo4j);

const graphService = new Neo4jConnection(db);
let discoverer = new Discoverer(logger);
let registry = discoverer.loadDirectory("./graph");
let deployer = new DbDeployer(registry, graphService, logger);

deployer.launch().then( r => db.close());