import { Db, MongoClient } from "mongodb";

export class MongoDBConnection {
  private static isConnected: boolean = false;
  private static db: Db;

  public static getConnection(uri: string): Promise<Db> {
    if (this.db) {
      return Promise.resolve(this.db);
    }

    return this.connect(uri);
  }

  public static async connect(uri: string): Promise<Db> {
    const cnx = await MongoClient.connect(uri);
    return cnx.db();
  }
}
