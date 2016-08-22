import {User} from "../../models";

export interface IUserStore {
    find(username: string, password: string): Promise<User>;
}