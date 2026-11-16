const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  // 1. If explicit non-local URI provided (like MongoDB Atlas), connect directly
  if (uri && !uri.includes('127.0.0.1') && !uri.includes('localhost')) {
    try {
      const conn = await mongoose.connect(uri);
      console.log(`[MongoDB] Connected to Atlas/Remote Cluster: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.error(`[MongoDB] Failed to connect to remote URI: ${err.message}`);
      throw err;
    }
  }

  // 2. Try connecting to local MongoDB daemon (timeout fast so we don't block app)
  const localUri = uri || 'mongodb://127.0.0.1:27017/utsavlocal';
  try {
    const conn = await mongoose.connect(localUri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[MongoDB] Connected to local MongoDB daemon: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (localErr) {
    console.log(`[MongoDB] Local MongoDB daemon not reachable on ${localUri} (${localErr.message}).`);
    console.log(`[MongoDB] Starting high-performance embedded MongoMemoryServer for development...`);
  }

  // 3. Fallback to embedded in-memory MongoDB server
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoMemoryServer = await MongoMemoryServer.create();
    const memoryUri = mongoMemoryServer.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`[MongoDB] Connected to embedded MongoMemoryServer at: ${memoryUri}`);
    return conn;
  } catch (memErr) {
    console.error(`[MongoDB Error] Failed to initialize database: ${memErr.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
  } catch (err) {
    console.error(`[MongoDB Error disconnecting]`, err);
  }
};

module.exports = { connectDB, disconnectDB };
