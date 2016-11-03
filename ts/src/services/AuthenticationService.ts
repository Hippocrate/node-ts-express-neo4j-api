import jwt = require("jsonwebtoken");
import config from "../config/env/index";
import {injectable, inject} from "inversify";
import { Request, Response, NextFunction } from "express";

import { UserClaims } from "../models";
import { TYPES } from "../constants";
import { UserStore } from "./store";

export interface AuthenticationResult {
    succeeded: boolean;
    accessToken?: string;
    user?: any;
}

@injectable()
export class AuthenticationService {
    static TOKEN_LIFETIME = 1000 * 3600 * 24 * 7; // one week

    constructor(
        @inject(TYPES.UserStore) private userStore: UserStore

    ) {}

    createToken(claims: UserClaims): string {
        claims.expirationTime = new Date().getTime() + AuthenticationService.TOKEN_LIFETIME;
        return jwt.sign(claims, config.jwtSecret);
    }

    async authenticate(username: string, password: string): Promise<AuthenticationResult> {
        const user = await this.userStore.findByName(username);

        if (username === user.username && password === user.password) {
            const accessToken = this.createToken({
                id: user.id,
                username: user.username,
                expirationTime: new Date().getTime() + AuthenticationService.TOKEN_LIFETIME
            });
            user.accessToken = accessToken;
            await this.userStore.update(user);
            
            return {
                succeeded: true,
                accessToken,
                user
            };
        }

        return { succeeded: false };
    }
}