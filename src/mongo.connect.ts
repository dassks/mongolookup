import { MongoClient } from 'mongodb';
import { ObjectId } from 'mongodb';

export type LookupResult = { collection: string, dataModel: object };

export class MongoConnectController {
    url = "";
    dbName = "";
    password = "";

    mongoConnection: any; // Mongo live client

    constructor(dbUrl: string, dbPassword: string, dbName: string) {
        this.url = dbUrl;
        this.password = dbPassword;
        this.dbName = dbName;
    }

    public initialiseConnection(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            MongoClient.connect(this.url, (err, client) => {
                if (err) {
                    console.error("Error connecting to mongo: ", err);
                    return reject("Error connecting to mongo: " + err);
                }
                console.log("Connected to db server");
                this.mongoConnection = client.db(this.dbName);
                resolve(true);
            });
        });
    }

    public async listDocuments(collection: string): Promise<Array<any>> {
        if (this.mongoConnection) {
            let coll = this.mongoConnection.collection(collection);
            coll.find({}).toArray((err, docs) => {
                if (err) {
                    console.error("Error looking up docs", err);
                    return;
                }

                console.log("Found docs: ", docs);
                return docs;
            });
        } else {
            console.error("No active connection to db... Unable to lookup documents");
            return [];
        }
    }


    public async findOneUnknownCollection(lookupId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.mongoConnection) {
                this.mongoConnection.listCollections().toArray((err, collections) => {
                    if (err) {
                        throw new Error("Error finding collection list");
                    }
                    for (let i of collections) {
                        this.mongoConnection.collection(i.name).find({ _id: ObjectId.createFromHexString(lookupId) }).toArray((err, docs) => {
                            if (err) {
                                throw new Error("Error finding collection list");
                            }

                            if (docs.length === 1) {
                                resolve({ collection: i.name, dataModel: docs[0] });
                            }

                            resolve(null);


                        });
                    }
                    // return null;
                });
            } else {
                resolve(null);
            }
        });
    }
}