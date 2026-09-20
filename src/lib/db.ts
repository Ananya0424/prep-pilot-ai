import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  // If MONGODB_URI is empty or placeholder cluster0, return null for fallback mode
  if (!MONGODB_URI || MONGODB_URI.includes('cluster0.mongodb.net')) {
    return null;
  }

  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 3000,
    };

    cached!.promise = mongoose.connect(MONGODB_URI, opts).then(m => m);
  }

  try {
    cached!.conn = await cached!.promise;
    return cached!.conn;
  } catch (e) {
    console.warn('[MongoDB Warning] Could not connect to MongoDB URI. Using fallback mode.');
    cached!.promise = null;
    return null;
  }
}
