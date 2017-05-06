import { Strategy } from "passport-http-bearer";
import { Container, injectable, inject } from "inversify";
import { PassportStatic } from "passport";
import { TYPES } from "../constants";
import { UserStore } from "../services/store";
import { UserClaims } from "../models";
import config from "./env/index";
import container from "./di";
import jwt = require("jsonwebtoken");

const BearerStrategy: Strategy = require("passport-http-bearer").Strategy;
function configureAuthentication(passport: PassportStatic) {
    // Configure the Bearer strategy for use by Passport.
    //
    // The Bearer strategy requires a `verify` function which receives the
    // credentials (`token`) contained in the request.  The function must invoke
    // `cb` with a user object, which will be set at `req.user` in route handlers
    // after authentication.
    passport.use(new Strategy(
      function(token, cb) {
          let db = container.get<UserStore>(TYPES.UserStore);
          try {
              let identity: UserClaims = jwt.verify(token, config.jwtSecret);
              
              db.find(identity.id).then( user => {
                  let time = new Date().getTime();
                  if ( 
                      user
                      && user.enabled
                      && user.accessToken 
                      && user.accessToken === token 
                      && identity.expirationTime > time 
                    ) {

                      cb(null, user);
                  } else {
                      cb(null, false);
                  }
              } ).catch( e => {
                cb(e);
              });
            } catch (e) {
                cb(null, false);
            } 
    }));

    // Configure Passport authenticated session persistence.
    //
    // In order to restore authentication state across HTTP requests, Passport needs
    // to serialize users into and deserialize users out of the session.  In a
    // production-quality application, this would typically be as simple as
    // supplying the user ID when serializing, and querying the user record by ID
    // from the database when deserializing.  However, due to the fact that this
    // example does not have a database, the complete Twitter profile is serialized
    // and deserialized.
    passport.serializeUser(function(user, cb) {

      cb(null, user);
    });

    passport.deserializeUser(function(obj, cb) {
      cb(null, obj);
    });

  return passport;
}

export default configureAuthentication;