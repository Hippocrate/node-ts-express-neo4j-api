import Promise = require( "bluebird" );

export class User {
    _id: string;
    firstName: string;
    lastName: string;
    facebookId: string;
    accessToken: string;
    accessTokenExpiration: Date;
    email: string;
    gender: string;
    locale: string;
    hometown: string;
}