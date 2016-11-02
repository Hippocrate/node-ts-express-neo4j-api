import jwt = require("jsonwebtoken");
import config from "../../config/env/index";
import {injectable} from "inversify";
import { Request, Response, NextFunction } from "express";
import passport = require("passport");
import express = require("express");

// sample user, used for authentication
const user = {
  username: "username",
  password: "password"
};

export interface AuthenticationResult {
    succeeded: boolean;
    accessToken?: string;
    user?: any;
}

@injectable()
export class AuthenticationService {
    static authorize(): express.Handler {
        return passport.authenticate("bearer", { session: false });
    }

    authenticate(username: string, password: string, ...args: string[]): AuthenticationResult {
        // Ideally you'll fetch this from the db
        // Idea here was to show how jwt works with simplicity
        if (username === user.username && password === user.password) {
            const accessToken = jwt.sign({
                username: user.username
            }, config.jwtSecret);

            return {
                succeeded: true,
                accessToken,
                user: {
                    username: username
                }
            };
        }

        return { succeeded: false };
    }
}