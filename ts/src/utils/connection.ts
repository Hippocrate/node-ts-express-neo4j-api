import { Db, MongoClient } from "mongodb";
let neo4j = require("neo4j");

export class MongoDBConnection {
  private static isConnected: boolean = false;
  private static db: Db;

  public static getConnection(uri: string): Promise<Db> {
    if (this.db) {
        return Promise.resolve(this.db);
    }

    return this.connect(uri);
  }

  public static connect(uri: string): Promise<Db> {
    return new Promise<Db>((resolve, reject) => {
        MongoClient.connect(uri, (error, db: Db) => {
          if (error) {
              reject(error);
          } else {
              this.db = db;
              resolve(db);
          }
        });
    });
  }
}

export class Neo4jConnection {
    private static db: any;
    
    public static getConnection(uri: string): any {
        if (this.db) {
            return this.db;
        } 
        
        return this.connect(uri);
    }

    public static connect(uri: string): any {
        return new neo4j.GraphDatabase(uri);
    }
}