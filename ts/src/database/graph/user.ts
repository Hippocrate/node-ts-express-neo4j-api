import { GraphItem, Prop } from "../decorators";
import {Vertice, Edge}  from "../dbtypes";

@GraphItem("User")
export class User extends Vertice {
    @Prop({
        readonly: true,
        mandatory: true,
        indexed: true,
        unique: true
    }) userName: string;

    @Prop() firstName: string;
    @Prop() lastName: string;

    @Prop({
        indexed: true,
        mandatory: true,
        unique: true
    }) facebookId: string;

    @Prop({
        indexed: true,
        unique: true
    }) accessToken: string;

    @Prop() accessTokenExpiration: Date;
    @Prop({
        indexed: true,
        unique: true
    }) email: string;

    @Prop() gender: string;
    @Prop() locale: string;
    @Prop() hometown: string;
}