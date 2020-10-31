import { GraphItem, Prop } from "../decorators";
import { Vertex, Edge }  from "../dbtypes";

@GraphItem("User")
export class User extends Vertex {
    @Prop({
        readonly: true,
        mandatory: true,
        indexed: true,
        unique: true
    }) username: string;
    
    @Prop({
        mandatory: true,
    }) password: string;

    @Prop({
        indexed: true,
        unique: true
    }) accessToken: string;

    @Prop({
        mandatory: true,
        indexed: true
    })
    enabled: boolean;
}