import { Constraint } from "utils";
import * as joi from "joi";
export class LoginModel {
    @Constraint(joi.string().required())
    
    username: string;
    @Constraint(joi.string().required())
    password: string;
}