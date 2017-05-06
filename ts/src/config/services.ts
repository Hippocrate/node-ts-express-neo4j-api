import { interfaces, Controller, TYPE } from "inversify-express-utils";
import { HomeController, AuthenticationController } from "../controllers";
import { IGraphDb, NeoGraphDb, IDocumentDb, MongoDB, AuthenticationService } from "../services";
import { UserStore } from "../services/store";
import { Container } from "inversify";
import { PassportStatic } from "passport";
import configureAuth from "./authentication";
import { TYPES } from "../constants";
import logger from "./winston";
import { LoggerInstance } from "winston";
import config from "./env";

export default function configureServices(container: Container, passport: PassportStatic): Container {
    container.bind<LoggerInstance>( TYPES.LoggerInstance ).toConstantValue(logger);
    container.bind<IGraphDb>( TYPES.IGraphDb ).toConstantValue(new NeoGraphDb(config.neo4j));
    container.bind<IDocumentDb>( TYPES.IDocumentDb ).toConstantValue(new MongoDB(config.mongodb));
    container.bind<PassportStatic>( TYPES.Passport ).toConstantValue(passport);
    container.bind<AuthenticationService>( TYPES.AuthenticationService ).to(AuthenticationService).inSingletonScope();
    container.bind<UserStore>( TYPES.UserStore ).to(UserStore).inSingletonScope();
    
    // controllers
    container.bind<interfaces.Controller>( TYPE.Controller ).to( HomeController ).whenTargetNamed("HomeController");
    container.bind<interfaces.Controller>( TYPE.Controller ).to( AuthenticationController ).whenTargetNamed("AuthenticationController");

    return container;
}