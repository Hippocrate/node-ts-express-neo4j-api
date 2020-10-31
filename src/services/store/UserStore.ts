import { injectable } from "inversify";
import { User } from "../../database/graph";
import { commandBuilder, Neo4jConnection } from "database/services";
import * as parser from 'parse-neo4j';

@injectable()
export class UserStore {
    constructor(
        private db: Neo4jConnection
    ) {
    }

    async findById(id: string): Promise<User | null> {
        const res = await this.db.query(`match (u:User {id: {id}}) return u`, { id });
        const data = parser.parse(res)[0];
        return new User(data);
    }

    async findByName(username: string): Promise<User | null> {
        const res = await this.db.query(`match (u:User {username: {username}}) return u`, { username });
        const data = parser.parse(res)[0];
        return new User(data);
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