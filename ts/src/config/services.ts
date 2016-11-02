import { interfaces, Controller, TYPE } from "inversify-express-utils";
import { HomeController, AuthenticationController } from "../server/controllers";
import { IGraphDb, NeoGraphDb, IDocumentDb, MongoDB, AuthenticationService } from "../server/services";
import { UserStore } from "../server/services/store";
import { Kernel } from "inversify";
import { Passport } from "passport";
import configureAuth from "./authentication";
import { TYPES } from "../constants";
import logger from "./winston";
import { LoggerInstance } from "winston";
import config from "./env";

export default function configureServices(kernel: Kernel, passport: Passport) {
    kernel.bind<LoggerInstance>( TYPES.LoggerInstance ).toConstantValue(logger);
    kernel.bind<IGraphDb>( TYPES.IGraphDb ).toConstantValue(new NeoGraphDb(config.neo4j));
    kernel.bind<IDocumentDb>( TYPES.IDocumentDb ).toConstantValue(new MongoDB(config.mongodb));
    kernel.bind<Passport>( TYPES.Passport ).toConstantValue(passport);
    kernel.bind<AuthenticationService>( TYPES.AuthenticationService ).to(AuthenticationService).inSingletonScope();
    kernel.bind<UserStore>( TYPES.UserStore ).to(UserStore).inSingletonScope();
    
    // controllers
    kernel.bind<interfaces.Controller>( TYPE.Controller ).to( HomeController ).whenTargetNamed("HomeController");
    kernel.bind<interfaces.Controller>( TYPE.Controller ).to( AuthenticationController ).whenTargetNamed("AuthenticationController");

    return kernel;
}