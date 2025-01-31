import {
  MongoClient,
  Db,
  Collection,
  Document,
  Filter,
  WithId,
  OptionalUnlessRequiredId,
} from "mongodb";

interface MongoConfig {
  uri?: string;
  dbName?: string;
}

export class MongoDBAdapter {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private config: Required<MongoConfig>;

  constructor(config: MongoConfig = {}) {
    this.config = {
      uri: config.uri || process.env.MONGODB_URI || "mongodb://localhost:27017",
      dbName: config.dbName || process.env.MONGODB_DB || "fireblox",
    };
  }

  async connect(): Promise<void> {
    try {
      if (!this.client) {
        this.client = await MongoClient.connect(this.config.uri);
        this.db = this.client.db(this.config.dbName);
        console.log("Successfully connected to MongoDB");
      }
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.client) {
        await this.client.close();
        this.client = null;
        this.db = null;
        console.log("Successfully disconnected from MongoDB");
      }
    } catch (error) {
      console.error("Error disconnecting from MongoDB:", error);
      throw error;
    }
  }

  private getCollection<T extends Document>(
    collectionName: string
  ): Collection<T> {
    if (!this.db) {
      throw new Error("Database connection not established");
    }
    return this.db.collection<T>(collectionName);
  }

  async findOne<T extends Document>(
    collectionName: string,
    query: Filter<T>
  ): Promise<WithId<T> | null> {
    const collection = this.getCollection<T>(collectionName);
    return await collection.findOne(query);
  }

  async find<T extends Document>(
    collectionName: string,
    query: Filter<T>,
    options?: { limit?: number; skip?: number }
  ): Promise<WithId<T>[]> {
    const collection = this.getCollection<T>(collectionName);
    const cursor = collection.find(query);

    if (options?.skip) cursor.skip(options.skip);
    if (options?.limit) cursor.limit(options.limit);

    return await cursor.toArray();
  }

  async insertOne<T extends Document>(
    collectionName: string,
    document: OptionalUnlessRequiredId<T>
  ): Promise<WithId<T>> {
    const collection = this.getCollection<T>(collectionName);
    const result = await collection.insertOne(document);
    return { ...document, _id: result.insertedId } as WithId<T>;
  }

  async insertMany<T extends Document>(
    collectionName: string,
    documents: OptionalUnlessRequiredId<T>[]
  ): Promise<WithId<T>[]> {
    const collection = this.getCollection<T>(collectionName);
    const result = await collection.insertMany(documents);
    return documents.map((doc, index) => ({
      ...doc,
      _id: result.insertedIds[index],
    })) as WithId<T>[];
  }

  async updateOne<T extends Document>(
    collectionName: string,
    query: Filter<T>,
    update: Partial<T>
  ): Promise<boolean> {
    const collection = this.getCollection<T>(collectionName);
    const result = await collection.updateOne(query, { $set: update });
    return result.modifiedCount > 0;
  }

  async deleteOne<T extends Document>(
    collectionName: string,
    query: Filter<T>
  ): Promise<boolean> {
    const collection = this.getCollection<T>(collectionName);
    const result = await collection.deleteOne(query);
    return result.deletedCount > 0;
  }

  async deleteMany<T extends Document>(
    collectionName: string,
    query: Filter<T>
  ): Promise<number> {
    const collection = this.getCollection<T>(collectionName);
    const result = await collection.deleteMany(query);
    return result.deletedCount;
  }
}
