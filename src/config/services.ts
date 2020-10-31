import { AuthenticationService } from "../services";
import { UserStore } from "../services/store";
import { Container } from "inversify";
import { PassportStatic } from "passport";
import logger from "./winston";
import config from "./env";
import { Logger } from "utils/Logger";
import { Neo4jConnection } from "database/services";

export default function configureServices(container: Container, passport: PassportStatic): Container {
    container.bind(Logger).toConstantValue(logger);
    container.bind(Neo4jConnection).toConstantValue(new Neo4jConnection(config.neo4jUrl, config.neo4jUsername, config.neo4jPassword));
    container.bind(AuthenticationService).to(AuthenticationService).inSingletonScope();
    container.bind(UserStore).to(UserStore).inSingletonScope();
    return container;
}
