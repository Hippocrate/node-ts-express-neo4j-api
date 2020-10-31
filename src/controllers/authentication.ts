import "reflect-metadata";
import { Request, Response, NextFunction } from "express";
import { AuthenticationResult, AuthenticationService } from "../services";
import { controller, httpPost } from "inversify-express-utils";
import { validateBody } from "utils";
import { LoginModel } from "models/request/LoginModel";
import { commandBuilder, Neo4jConnection } from "database/services";
import { User } from "database/graph";

@controller("/api/authentication")
export class AuthenticationController {
    constructor(
        private authService: AuthenticationService,
        private db: Neo4jConnection
        ) {
    }

    @httpPost("/login", validateBody(LoginModel))
    public async login(req: Request, res: Response, next: NextFunction): Promise<AuthenticationResult> {
        let result = await this.authService.authenticate(req.body.username, req.body.password);
        return result;
    }

    
}