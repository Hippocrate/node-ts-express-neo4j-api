import "reflect-metadata";
import { Controller, Post, Get } from "inversify-express-utils";
import { injectable, inject } from "inversify";
import { Request, Response, NextFunction } from "express";
import { Passport } from "passport";
import { TYPES }  from "../../constants";
import request = require("request");
import {AuthenticationService} from "../services";
import httpStatus = require("http-status");

@injectable()
@Controller("/api/authentication")
export class AuthenticationController {

    constructor(
        @inject(TYPES.AuthenticationService) private authService: AuthenticationService) {
    }

    @Post("/login")
    public login(req: Request, res: Response, next: NextFunction): any {
        let result = this.authService.authenticate(req.body.username, req.body.password);
        if (result.succeeded) {
            return result;
        }

        return httpStatus.UNAUTHORIZED;
    }
}