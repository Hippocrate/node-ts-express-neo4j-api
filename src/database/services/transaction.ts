import { v1 as neo4j } from 'neo4j-driver';
import { Neo4jConnection } from "./Neo4jConnection";

class Neo4jTransaction extends Neo4jConnection {
    _transaction: neo4j.Transaction;

    constructor(cnx: Neo4jConnection) {
        super(cnx.getDriver());
    }

    begin() {
        if (this._transaction) {
            throw new Error("Can not begun transaction: the transaction is already begun");
        }
        this._transaction = this._driver.session().beginTransaction();
        return this._transaction;
    }

    async query(query: string, params?: any): Promise<neo4j.StatementResult> {
        const result = await this._transaction.run(query, params);
        return result;
    }

    async first(query: string, params?: any) {
        const result = await this.query(query, params);
        return {
            record: result.records[0],
            summary: result.summary
        };
    }
}

export function runTransaction<T>(cnx: Neo4jConnection, scope: (tnx: Neo4jConnection, rollback: () => void) => Promise<T> | T): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        const txCnx = new Neo4jTransaction(cnx);
        const tx = txCnx.begin();
        const commit = (result: T) => {
            tx.commit()
                .then(r => resolve(result))
                .catch(e => reject(e));
        };
        let rolledback = false;
        const rollback = (error?: any) => {
            rolledback = true;
            tx.rollback()
                .then(r => {
                    if (error) {
                        reject(error);
                    }
                })
                .catch(e => reject(e));
        };
        try {
            const res = scope(txCnx, rollback);
            if (res && res instanceof Promise) {
                res.then(val => {
                    if (!rolledback) {
                        commit(val);
                    }
                    else {
                        resolve(val);
                    }
                }, e => {
                    rollback(e);
                    if (!e) {
                        // must do not happen
                        resolve(null);
                    }
                });
            }
            else {
                if (!rolledback) {
                    commit(res as T);
                }
                else {
                    resolve(res);
                }
            }
        }
        catch (e) {
            rollback(e);
        }
    });
}
