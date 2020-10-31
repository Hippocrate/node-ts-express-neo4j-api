import { httpGet, controller } from "inversify-express-utils";
import { Request, Response, NextFunction } from "express";
import { authorize } from "../utils";
import { Neo4jConnection } from "database/services";

@controller("/")
export class HomeController {
    constructor(private _db: Neo4jConnection) {
    }

    @httpGet("protected", authorize())
    public getProtecetedResource(req: Request, res: Response): any {
        return `Your are authorized !`;
    }

    @httpGet("/")
    public get(req: Request, res: Response,): any {
        return `Hello world`;
    }
}