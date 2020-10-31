import { injectable } from "inversify";
import { User } from "../../database/graph";
import { commandBuilder, Neo4jConnection } from "database/services";

@injectable()
export class UserStore {
    constructor(
        private db: Neo4jConnection
    ) {
    }

    findById(id: string): Promise<User | null> {
        return this.db.first(`match (u:User {id: {id}}) return u`, { id })
            .then(r => r && r.record ? new User(r.record) : null);
    }

    findByName(username: string): Promise<User | null> {
        return this.db.first(`match (u:User {username: {username}}) return u`, { username })
            .then(r => r && r.record ? new User(r.record) : null);
    }

    exists(username: string): Promise<boolean> {
        return this.db.first(`match (u:User) where u.username = {username} return u`, { username })
            .then(r => r ? true : false);
    }

    async update(user: User): Promise<User> {
        await commandBuilder().update(user).save(this.db);
        return user;
    }
}