export interface MongoDBConfig {
  uri: string;
  dbName: string;
  options?: {
    maxPoolSize?: number;
    connectTimeoutMS?: number;
    socketTimeoutMS?: number;
  };
}

export const getMongoConfig = (): MongoDBConfig => {
  const config: MongoDBConfig = {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017",
    dbName: process.env.MONGODB_DB_NAME || "default_db",
    options: {
      maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || "10"),
      connectTimeoutMS: parseInt(
        process.env.MONGODB_CONNECT_TIMEOUT || "10000"
      ),
      socketTimeoutMS: parseInt(process.env.MONGODB_SOCKET_TIMEOUT || "45000"),
    },
  };

  return config;
};
