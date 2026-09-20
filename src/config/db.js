import mongoose from 'mongoose';
import dns from 'dns';
import { config } from './env.js';

try {
  dns.setDefaultResultOrder('ipv4first');
  const currentServers = dns.getServers();
  if (
    !currentServers ||
    currentServers.length === 0 ||
    currentServers.some((s) => s.includes('127.0.0.1') || s.includes('::1') || s.includes('fe80::'))
  ) {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  }
} catch (e) {
  // Fallback to default DNS settings if setting custom servers fails
}

/**
 * Global variable for caching connection in serverless environments (Vercel)
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (process.env.VERCEL === '1' && (!config.mongoUri || config.mongoUri.includes('127.0.0.1') || config.mongoUri.includes('localhost'))) {
    throw new Error('Vercel environment requires a cloud MongoDB Atlas URI. Please set MONGO_URI in Vercel Project Settings.');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(config.mongoUri, opts).then((mongooseInstance) => {
      console.log('MongoDB connected successfully');
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('MongoDB connection error:', e.message);
    throw e;
  }

  return cached.conn;
}

export default connectDB;
