import { Db, ObjectID } from "mongodb";
import { injectable } from "inversify";
import { MongoDBConnection } from "../../utils/connection";
import {IDocumentDb} from "../IDocumentDb";

@injectable()
export class MongoDB implements IDocumentDb {
  public db: Db;

  constructor(uri: string) {
    MongoDBConnection.getConnection(uri).then(db => this.db = db);
  }

  public find<T>(collection: string, filter: Object): Promise<T[]> {
    return new Promise<T[]>((resolve, reject) => {
      this.db.collection(collection).find(filter).toArray((error, find) => {
        if (error) {
          reject(error);
        } else {
          resolve(find);
        }
      });
    });
  }

  public findOneById<T>(collection: string, objectId: string): Promise<T> {
      return new Promise<T>((resolve, reject) => {
          this.db.collection(collection).find({ _id: new ObjectID(objectId) }).limit(1).toArray((error, find) => {
              if (error) {
                reject(error);
              } else {
                resolve(find[0]);
              }
          });
      });
  }

  public insert<T>(collection: string, model: T):  Promise<T> {
      return new Promise<T>((resolve, reject) => {
          this.db.collection(collection).insertOne(model, (error, insert) => {
            if (error) {
              reject(error);
            } else {
              resolve(model);
            }
          });
      });
  }

  public update<T>(collection: string, objectId: string, model: T): Promise<T> {
      return new Promise<T>((resolve, reject) => {
          this.db.collection(collection).updateOne({ _id: new ObjectID(objectId) }, model, (error, update) => {
              if (error) {
                reject(error);
              } else {
                resolve(model);
              }
          });
      });

  }

  public remove(collection: string, objectId: string ):  Promise<any> {
      return new Promise<any>((resolve, reject) => {
          this.db.collection(collection).deleteOne({ _id: new ObjectID(objectId) }, (error, remove) => {
            if (error) {
                reject(error);
              } else {
                resolve(remove);
              }
          });
      });
  }
}
