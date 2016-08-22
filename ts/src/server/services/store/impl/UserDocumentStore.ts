import { IUserStore } from "../IUserStore";
import { IDocumentDb } from "../../IDocumentDb";
import { injectable, inject } from "inversify";
import { TYPES }  from "../../../../constants";
import {User} from "../../../models";

@injectable()
export class UserDocumentStore implements IUserStore {
    constructor(@inject(TYPES.IDocumentDb) private _db: IDocumentDb ) {

    }

    find(username: string, password: string): Promise<User> {
        return this._db.find<User>("user", {
            username,
            password
        }).then( res => res[0] );
    }
}