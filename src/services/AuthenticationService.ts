import jwt = require("jsonwebtoken");
import config from "../config/env/index";
import { injectable, inject } from "inversify";
import { UserClaims } from "../models";
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
        private userStore: UserStore
    ) { }

    createToken(claims: UserClaims): string {
        claims.expirationTime = new Date().getTime() + AuthenticationService.TOKEN_LIFETIME;
        return jwt.sign(claims, config.jwtSecret);
    }

    async authenticate(username: string, password: string): Promise<AuthenticationResult> {
        const user = await this.userStore.findByName(username);
        if (!user) {
            return {
                succeeded: false
            }
        }
        if (username === user.username && password === user.password) {
            const accessToken = this.createToken({
                id: user.id,
                username: user.username,
                expirationTime: new Date().getTime() + AuthenticationService.TOKEN_LIFETIME
            });
            user.accessToken = accessToken;

            return {
                succeeded: true,
                accessToken,
                user
            };
        }

        return { succeeded: false };
    }
}