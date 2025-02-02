import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

if (!MONGODB_DB_NAME) {
  throw new Error('Please define the MONGODB_DB_NAME environment variable inside .env');
}

const options: mongoose.ConnectOptions = {
  maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || '10'),
  connectTimeoutMS: parseInt(process.env.MONGODB_CONNECT_TIMEOUT || '10000'),
  socketTimeoutMS: parseInt(process.env.MONGODB_SOCKET_TIMEOUT || '45000'),
  dbName: MONGODB_DB_NAME,
};

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, options).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase; 