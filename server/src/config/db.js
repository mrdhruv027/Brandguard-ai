const mongoose = require('mongoose');

let isConnected = false;
let connectionError = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/brandguard_ai';
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    isConnected = true;
    connectionError = null;
    console.log(`[BrandGuard DB] MongoDB Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    isConnected = false;
    connectionError = err.message;
    console.warn(`[BrandGuard DB] Real MongoDB connection unavailable (${err.message}). Activating resilient In-Memory/Local Store.`);
    return null;
  }
};

const getDBStatus = () => ({
  isConnected,
  isInMemory: !isConnected,
  error: connectionError,
});

module.exports = { connectDB, getDBStatus };
